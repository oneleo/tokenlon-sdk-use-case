import { Wallet } from "ethers"
import { ethers, network } from "hardhat"
import { mainnetAddr } from "./utils/addresses"
import * as cheatcodes from "./utils/cheatcodes"
import {
  RFQOrder,
  RFQFill,
  SignatureType,
  encodingHelper,
  signingHelper,
} from "@tokenlon/contracts-lib/v5"

const EXPIRY = Math.floor(Date.now() / 1000) + 86400

async function main() {
  // Hardhat network information
  console.log("Chain id:", (await ethers.provider.getNetwork()).chainId)
  console.log("Network name:", network.name)
  const blockNumBefore = await ethers.provider.getBlockNumber()
  console.log("Block number:", blockNumBefore.toString())
  const blockBefore = await ethers.provider.getBlock(blockNumBefore)
  console.log("Block timestamp:", blockBefore.timestamp.toString())

  // Create multiple contract instances
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
    cheatcodes.dealETH(user, ethers.utils.parseEther("100"))

    // Transfer 100 ETH to maker wallet
    const maker = Wallet.createRandom().connect(ethers.provider)
    cheatcodes.dealETH(maker, ethers.utils.parseEther("100"))

    // Set default order
    const defaultOrder: RFQOrder = {
      // Could override following fields at need in each case
      takerAddr: user.address,
      makerAddr: maker.address,
      takerAssetAddr: mainnetAddr.WETH,
      makerAssetAddr: mainnetAddr.DAI,
      takerAssetAmount: 1,
      makerAssetAmount: 1000,
      salt: signingHelper.generateRandomSalt(),
      deadline: EXPIRY,
      feeFactor: 0,
    }

    // Set maker order from defaultOrder
    const order = {
      ...defaultOrder,
    }

    // Approve transfer of makerAssetAddr permission to AllowanceTarget contract.
    await cheatcodes.dealTokenAndApprove(
      maker,
      mainnetAddr.AllowanceTarget,
      order.makerAssetAddr,
      order.makerAssetAmount
    )

    // Create maker EOA signature for AMMWrapper contract via Tokenlon SDK library.
    const makerSignature = await signingHelper.signRFQOrder(order, {
      type: SignatureType.EIP712,
      signer: maker,
      verifyingContract: mainnetAddr.RFQ,
    })

    // Create taker EOA signature for AMMWrapper contract via Tokenlon SDK library.
    const fill: RFQFill = {
      ...order,
      receiverAddr: user.address,
    }
    const takerSignature = await signingHelper.signRFQFillOrder(fill, {
      type: SignatureType.EIP712,
      signer: user,
      verifyingContract: mainnetAddr.RFQ,
    })

    // Create payload for RFQ contract via Tokenlon SDK library.
    const payload = encodingHelper.encodeRFQFill({
      ...fill,
      makerSignature,
      takerSignature,
    })

    // Print user balance before transaction
    console.log("Balance before transaction:")
    console.log(
      "\tUser's ETH:",
      (await ethers.provider.getBalance(user.address)).toString()
    )
    console.log(
      "\tUser's DAI:",
      (await DAIContract.balanceOf(user.address)).toString()
    )
    console.log(
      "\tMaker's WETH:",
      (await WETHContract.balanceOf(maker.address)).toString()
    )
    console.log(
      "\tMaker's DAI:",
      (await DAIContract.balanceOf(maker.address)).toString()
    )

    // Send payload from Tokenlon proxy to RFQ contract via Tokenlon SDK library.
    const tx = await UserProxyContract.connect(user).toRFQ(payload, {
      value: order.takerAssetAmount,
    })
    await tx.wait()
    console.log("Complete the transaction of the RFQ contract")

    // Print user balance after transaction
    console.log("Balance after transaction:")
    console.log(
      "\tUser's ETH:",
      (await ethers.provider.getBalance(user.address)).toString()
    )
    console.log(
      "\tUser's DAI:",
      (await DAIContract.balanceOf(user.address)).toString()
    )
    console.log(
      "\tMaker's WETH:",
      (await WETHContract.balanceOf(maker.address)).toString()
    )
    console.log(
      "\tMaker's DAI:",
      (await DAIContract.balanceOf(maker.address)).toString()
    )
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
