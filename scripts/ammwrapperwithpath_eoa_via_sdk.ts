import { Wallet } from "ethers"
import { ethers, network } from "hardhat"
import { mainnetAddr } from "./utils/addresses"
import * as tokenUtils from "./utils/tokenUtils"
import {
  AMMOrder,
  SignatureType,
  encodingHelper,
  signingHelper,
} from "@tokenlon/contracts-lib/v5"

const EXPIRY = Math.floor(Date.now() / 1000) + 86400
const ethUnit = ethers.utils.parseEther("1")
const wethUnit = ethers.utils.parseUnits("1.0", mainnetAddr.WETHDecimals)
const daiUnit = ethers.utils.parseUnits("1.0", mainnetAddr.DAIDecimals)

async function main() {
  // Print network information
  console.log("Chain id:", (await ethers.provider.getNetwork()).chainId)
  console.log("Network name:", network.name)
  const blockNumBefore = await ethers.provider.getBlockNumber()
  console.log("Block number:", blockNumBefore.toString())
  const blockBefore = await ethers.provider.getBlock(blockNumBefore)
  console.log("Block timestamp:", blockBefore.timestamp.toString())

  // Create multiple contract instances
  const UniswapV2RouterContract = await ethers.getContractAt(
    "IUniswapRouterV2",
    mainnetAddr.UniswapV2Router
  )
  const UserProxyContract = await ethers.getContractAt(
    "IUserProxy",
    mainnetAddr.UserProxy
  )
  const WETHContract = await ethers.getContractAt(
    "contracts/interfaces/IERC20.sol:IERC20",
    mainnetAddr.WETH
  )
  const DAIContract = await ethers.getContractAt(
    "contracts/interfaces/IERC20.sol:IERC20",
    mainnetAddr.DAI
  )

  if (network.name === "hardhat") {
    // Transfer 100 ETH to user
    const user: Wallet = Wallet.createRandom().connect(ethers.provider)
    await tokenUtils.getEthFromHardhatAccounts(user, ethUnit.mul(100))

    // Set default order
    const defaultOrder: AMMOrder = {
      // Should fill following fields in each case
      makerAddr: "0x",
      // Could override following fields at need in each case
      takerAssetAddr: mainnetAddr.WETH,
      makerAssetAddr: mainnetAddr.DAI,
      takerAssetAmount: wethUnit.mul(1),
      makerAssetAmount: daiUnit.mul(1000),
      userAddr: user.address,
      receiverAddr: user.address,
      salt: signingHelper.generateRandomSalt(),
      deadline: EXPIRY,
    }

    // Set the makerAddr to UniswapV2Router
    const order = {
      ...defaultOrder,
      makerAddr: mainnetAddr.UniswapV2Router,
    }
    console.log("Set the makerAddr to UniswapV2Router:", order.makerAddr)

    // Get makerAssetAmount from UniswapV2Router by paying takerAssetAddr
    // of takerAssetAmount using path [takerAssetAddr, makerAssetAddr].
    const path = [order.takerAssetAddr, order.makerAssetAddr]
    ;[, order.makerAssetAmount] = await UniswapV2RouterContract.getAmountsOut(
      order.takerAssetAmount,
      path
    )
    console.log(
      "Get makerAssetAmount from UniswapV2Router:",
      order.makerAssetAmount.toString()
    )

    // Swap 1 ETH to WETH via WETH contract
    await tokenUtils.swapWeth(user, mainnetAddr.WETH, wethUnit.mul(1))

    // Approve the transfer of takerAssetAddr permission to AllowanceTarget contract.
    await tokenUtils.approveToken(
      user,
      mainnetAddr.AllowanceTarget,
      order.takerAssetAddr,
      order.takerAssetAmount
    )

    // Create EOA signature for AMMWrapperWithPath contract via Tokenlon SDK library.
    const signature = await signingHelper.signAMMOrder(order, {
      type: SignatureType.EIP712,
      signer: user,
      verifyingContract: mainnetAddr.AMMWrapperWithPath,
    })

    // Create payload for AMMWrapperWithPath contract via Tokenlon SDK library.
    const payload = encodingHelper.encodeAMMTradeWithPath({
      ...order,
      feeFactor: 0,
      signature,
      makerSpecificData: "0x",
      path,
    })

    // Print user balance before transaction
    console.log("Balance before transaction:")
    console.log(
      "\tUser's WETH:",
      (await WETHContract.balanceOf(user.address)).toString()
    )
    console.log(
      "\tUser's DAI:",
      (await DAIContract.balanceOf(user.address)).toString()
    )

    // Send payload from Tokenlon proxy to AMMWrapper contract via Tokenlon SDK library.
    const tx = await UserProxyContract.connect(user).toAMM(payload)
    await tx.wait()
    console.log("Complete the transaction of the AMMWrapperWithPath contract")

    // Print user balance after transaction
    console.log("Balance after transaction:")
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
