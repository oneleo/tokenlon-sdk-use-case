import { Wallet } from "ethers"
import { ethers, network } from "hardhat"
import { mainnetAddr } from "./utils/addresses"
import * as cheatcodes from "./utils/cheatcodes"
import {
  AMMOrder,
  SignatureType,
  encodingHelper,
  signingHelper,
} from "@tokenlon/contracts-lib/v5"

const EXPIRY = Math.floor(Date.now() / 1000) + 86400

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
    cheatcodes.dealETH(user, ethers.utils.parseEther("100"))

    // Set default order
    const defaultOrder: AMMOrder = {
      // Should fill following fields in each case
      makerAddr: "0x",
      // Could override following fields at need in each case
      takerAssetAddr: mainnetAddr.WETH,
      makerAssetAddr: mainnetAddr.DAI,
      takerAssetAmount: 100,
      makerAssetAmount: 100 * 1000,
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

    // Approve transfer of takerAssetAddr permission to AllowanceTarget contract.
    await cheatcodes.dealTokenAndApprove(
      user,
      mainnetAddr.AllowanceTarget,
      order.takerAssetAddr,
      order.takerAssetAmount
    )

    // Create EOA signature for AMMWrapper contract via Tokenlon SDK library.
    const signature = await signingHelper.signAMMOrder(order, {
      type: SignatureType.EIP712,
      signer: user,
      verifyingContract: mainnetAddr.AMMWrapper,
    })

    // Create payload for AMMWrapper contract via Tokenlon SDK library.
    const payload = encodingHelper.encodeAMMTrade({
      ...order,
      feeFactor: 0,
      signature,
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
    console.log("Complete the transaction of the AMMWrapper contract")

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
