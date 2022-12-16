import { Wallet } from "ethers"
import { ethers, network } from "hardhat"
import { arbitrumAddr } from "./utils/addresses"
import * as tokenUtils from "./utils/tokenUtils"
import * as cheatcodes from "./utils/cheatcodes"
import {
  LimitOrder,
  LimitOrderFill,
  LimitOrderAllowFill,
  SignatureType,
  encodingHelper,
  signingHelper,
} from "@tokenlon/contracts-lib/v5"

const EXPIRY = Math.floor(Date.now() / 1000) + 86400
const ethUnit = ethers.utils.parseEther("1")
const wethUnit = ethers.utils.parseUnits("1.0", arbitrumAddr.WETHDecimals)
const daiUnit = ethers.utils.parseUnits("1.0", arbitrumAddr.DAIDecimals)

async function main() {
  // Hardhat network information
  console.log("Chain id:", (await ethers.provider.getNetwork()).chainId)
  console.log("Network name:", network.name)
  const blockNumBefore = await ethers.provider.getBlockNumber()
  console.log("Block number:", blockNumBefore.toString())
  const blockBefore = await ethers.provider.getBlock(blockNumBefore)
  console.log("Block timestamp:", blockBefore.timestamp.toString())

  // Create multiple contract instances

  const LimitOrderContract = await ethers.getContractAt(
    "ILimitOrder",
    arbitrumAddr.LimitOrder
  )
  const UserProxyContract = await ethers.getContractAt(
    "IUserProxy",
    arbitrumAddr.UserProxy
  )
  const WETHContract = await ethers.getContractAt(
    "contracts/interfaces/IERC20.sol:IERC20",
    arbitrumAddr.WETH
  )
  const DAIContract = await ethers.getContractAt(
    "contracts/interfaces/IERC20.sol:IERC20",
    arbitrumAddr.DAI
  )

  if (network.name === "hardhat") {
    const coordinator = Wallet.createRandom().connect(ethers.provider)

    // Transfer 100 ETH to user
    const user: Wallet = Wallet.createRandom().connect(ethers.provider)
    await tokenUtils.getEthFromHardhatAccounts(user, ethUnit.mul(100))

    // Transfer 100 ETH to maker wallet
    const maker = Wallet.createRandom().connect(ethers.provider)
    await tokenUtils.getEthFromHardhatAccounts(maker, ethUnit.mul(100))

    // Transfer 100 ETH to operator of LimitOrder contract
    const operator = await ethers.getSigner(await LimitOrderContract.operator())
    await tokenUtils.getEthFromHardhatAccounts(operator, ethUnit.mul(100))
    console.log("Get the operator of LimitOrder contract:", operator.address)

    // Replace coordinator on chain
    await cheatcodes.impersonate(operator.address)
    await LimitOrderContract.connect(operator).upgradeCoordinator(
      coordinator.address
    )
    await cheatcodes.stopImpersonate(operator.address)
    console.log(
      "Complete replace new coordinator on chain:",
      coordinator.address
    )

    // Set default order
    const defaultOrder: LimitOrder = {
      // Could override following fields at need in each case
      makerToken: arbitrumAddr.WETH,
      takerToken: arbitrumAddr.DAI,
      makerTokenAmount: wethUnit.mul(1),
      takerTokenAmount: daiUnit.mul(1000),
      maker: maker.address,
      taker: ethers.constants.AddressZero, // can be filled by anyone
      salt: signingHelper.generateRandomSalt(),
      expiry: EXPIRY,
    }

    // Set maker order from defaultOrder
    const order = {
      ...defaultOrder,
    }

    // Swap 1 ETH of maker and user to WETH via WETH contract
    await tokenUtils.swapWeth(maker, arbitrumAddr.WETH, wethUnit.mul(1))
    await tokenUtils.swapWeth(user, arbitrumAddr.WETH, wethUnit.mul(1))

    // Approve the transfer of makerToken permission to AllowanceTarget contract.
    await tokenUtils.approveToken(
      maker,
      arbitrumAddr.AllowanceTarget,
      defaultOrder.makerToken,
      defaultOrder.makerTokenAmount
    )

    // Swap 1 WETH of user to DAI via Uniswap contract
    await tokenUtils.swapTokenV3(
      user,
      arbitrumAddr.WETH,
      arbitrumAddr.DAI,
      wethUnit.mul(1)
    )

    // Approve transfer of takerToken permission to AllowanceTarget contract.
    await tokenUtils.approveToken(
      user,
      arbitrumAddr.AllowanceTarget,
      defaultOrder.takerToken,
      defaultOrder.takerTokenAmount
    )

    // Create maker EOA signature for LimitOrder contract via Tokenlon SDK library.
    const makerSignature = await signingHelper.signLimitOrder(order, {
      type: SignatureType.EIP712,
      signer: maker,
      verifyingContract: arbitrumAddr.LimitOrder,
    })

    // Create taker EOA signature for LimitOrder contract via Tokenlon SDK library.
    const orderHash = await signingHelper.getLimitOrderEIP712Digest(order, {
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: arbitrumAddr.LimitOrder,
    })
    const fill: LimitOrderFill = {
      orderHash,
      taker: user.address,
      recipient: user.address,
      takerTokenAmount: order.takerTokenAmount,
      takerSalt: signingHelper.generateRandomSalt(),
      expiry: EXPIRY,
    }
    const takerSignature = await signingHelper.signLimitOrderFill(fill, {
      type: SignatureType.EIP712,
      signer: user,
      verifyingContract: arbitrumAddr.LimitOrder,
    })

    // Create coordinator EOA signature for LimitOrder contract via Tokenlon SDK library.
    const allowFill: LimitOrderAllowFill = {
      orderHash,
      executor: user.address,
      fillAmount: order.takerTokenAmount,
      salt: signingHelper.generateRandomSalt(),
      expiry: EXPIRY,
    }
    const coordinatorSignature = await signingHelper.signLimitOrderAllowFill(
      allowFill,
      {
        type: SignatureType.EIP712,
        signer: coordinator,
        verifyingContract: arbitrumAddr.LimitOrder,
      }
    )

    // Create payload for LimitOrder contract via Tokenlon SDK library.
    const payload = encodingHelper.encodeLimitOrderFillByTrader({
      order,
      makerSignature,
      fill,
      takerSignature,
      allowFill,
      coordinatorSignature,
    })

    // Print user balance before transaction
    console.log("Balance before transaction:")
    console.log(
      "\tMaker's WETH:",
      (await WETHContract.balanceOf(maker.address)).toString()
    )
    console.log(
      "\tMaker's DAI:",
      (await DAIContract.balanceOf(maker.address)).toString()
    )
    console.log(
      "\tUser's WETH:",
      (await WETHContract.balanceOf(user.address)).toString()
    )
    console.log(
      "\tUser's DAI:",
      (await DAIContract.balanceOf(user.address)).toString()
    )

    // Send payload from Tokenlon proxy to LimitOrder contract via Tokenlon SDK library.
    const tx = await UserProxyContract.connect(user).toLimitOrder(payload)
    await tx.wait()
    console.log("Complete the transaction of the LimitOrder contract")

    // Print user balance after transaction
    console.log("Balance after transaction:")
    console.log(
      "\tMaker's WETH:",
      (await WETHContract.balanceOf(maker.address)).toString()
    )
    console.log(
      "\tMaker's DAI:",
      (await DAIContract.balanceOf(maker.address)).toString()
    )
    console.log(
      "\tUser's WETH:",
      (await WETHContract.balanceOf(user.address)).toString()
    )
    console.log(
      "\tUser's DAI:",
      (await DAIContract.balanceOf(user.address)).toString()
    )
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
