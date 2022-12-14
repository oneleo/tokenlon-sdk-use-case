import * as ethers from "ethers"
import * as hardhat from "hardhat"
import { Decimal } from "decimal.js"
import * as IUniswapV2ERC20 from "@uniswap/v2-core/build/IUniswapV2ERC20.json"
import * as IUniswapV2Router from "@uniswap/v2-periphery/build/IUniswapV2Router02.json"
import * as IUniswapV2Pair from "@uniswap/v2-periphery/build/IUniswapV2Pair.json"
import * as IUniswapV2Factory from "@uniswap/v2-periphery/build/IUniswapV2Factory.json"

// Max settlement time in seconds
const maxDelay = 60 * 2
// True if amount is input token, false if amount is output token
const isSellOrder = true
// Frontrunning tolerance
const maxSlippage = 100

// Reference from https://github.com/thegostep/uniswap-v2-helper
// Execute comment before using: yarn add --dev decimal.js @uniswap/v2-core @uniswap/v2-periphery
export async function swapToken(
  user: ethers.Signer,
  inputToken: string,
  outputToken: string,
  amount: string
) {
  // Only Mainnet or Arbitrum network can swap
  const chainId = await getChainId()
  if (chainId !== 1 && chainId !== 42161) {
    throw new Error("Not Mainnet or Arbitrum network")
  }

  // Get user info from signer
  const provider = user.provider!
  const userAddr = await user.getAddress()

  // Format token addresses
  const inputTokenAddr = ethers.utils.getAddress(inputToken)
  const outputTokenAddr = ethers.utils.getAddress(outputToken)

  // Create contract instances with user signature
  const inputTokenContract = new hardhat.ethers.Contract(
    inputTokenAddr,
    IUniswapV2ERC20.abi,
    user
  )
  const outputTokenContract = new hardhat.ethers.Contract(
    outputTokenAddr,
    IUniswapV2ERC20.abi,
    user
  )
  const uniswapRouterAddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
  const uniswapRouterContract = new hardhat.ethers.Contract(
    uniswapRouterAddr,
    IUniswapV2Router.abi,
    user
  )

  // Create contract instances with provider only
  const factoryContract = new hardhat.ethers.Contract(
    await uniswapRouterContract.factory(),
    IUniswapV2Factory.abi,
    provider
  )
  const pairContract = new hardhat.ethers.Contract(
    await factoryContract.getPair(
      inputTokenContract.address,
      outputTokenContract.address
    ),
    IUniswapV2Pair.abi,
    provider
  )

  // Get token decimals
  const inputDecimals = await inputTokenContract.decimals()
  const outputDecimals = await outputTokenContract.decimals()

  // Format token amount
  const inputAmount = ethers.utils.parseUnits(amount, inputDecimals)
  const outputAmount = ethers.utils.parseUnits(amount, outputDecimals)

  // Set swap path
  const path = [inputTokenAddr, outputTokenAddr]

  // Set swap deadline
  const currentTimestamp = (await provider.getBlock("latest")).timestamp
  const deadline = currentTimestamp + maxDelay

  // Get expected token amount
  const expectedAmount = isSellOrder
    ? (await uniswapRouterContract.getAmountsOut(inputAmount, path))[1]
    : (await uniswapRouterContract.getAmountsIn(outputAmount, path))[0]

  // Set safety amount
  const safetyAmount = isSellOrder
    ? expectedAmount.mul(
        ethers.BigNumber.from(1).sub(
          ethers.BigNumber.from(maxSlippage).div(10000)
        )
      )
    : expectedAmount.mul(
        ethers.BigNumber.from(1).add(
          ethers.BigNumber.from(maxSlippage).div(10000)
        )
      )

  const amountIn = isSellOrder ? inputAmount : safetyAmount
  const amountOut = isSellOrder ? safetyAmount : outputAmount

  // get token order
  const inputIs0 = (await pairContract.token0()) === inputTokenContract.address

  // get quotes
  const { reserve0, reserve1 } = await pairContract.getReserves()
  const inputUnit = ethers.utils.parseUnits(
    "1",
    await inputTokenContract.decimals()
  )
  const outputPerInputQuotePre = inputIs0
    ? inputUnit.mul(reserve1).div(reserve0)
    : inputUnit.mul(reserve0).div(reserve1)

  let reserve0Post
  let reserve1Post
  if (isSellOrder) {
    reserve0Post = inputIs0
      ? reserve0.add(inputAmount)
      : reserve0.sub(expectedAmount)
    reserve1Post = inputIs0
      ? reserve1.sub(expectedAmount)
      : reserve1.add(inputAmount)
  } else {
    reserve0Post = inputIs0
      ? reserve0.add(inputAmount)
      : reserve0.sub(expectedAmount)
    reserve1Post = inputIs0
      ? reserve1.sub(expectedAmount)
      : reserve1.add(inputAmount)
  }

  const outputPerInputQuotePost = inputIs0
    ? inputUnit.mul(reserve1Post).div(reserve0Post)
    : inputUnit.mul(reserve0Post).div(reserve1Post)

  const expectedSlippage = new Decimal(
    ethers.utils.formatUnits(outputPerInputQuotePost, outputDecimals)
  )
    .sub(ethers.utils.formatUnits(outputPerInputQuotePre, outputDecimals))
    .div(ethers.utils.formatUnits(outputPerInputQuotePre, outputDecimals))
    .mul(100)
    .toString()

  // check sufficient balance
  const balance = await inputTokenContract.balanceOf(userAddr)
  console.log(balance)
  console.log(amountIn)
  if (balance.lt(amountIn)) {
    throw new Error("insufficient balance")
  }

  // check sufficient allowance
  const allowance = await inputTokenContract.allowance(
    userAddr,
    uniswapRouterContract.address
  )

  if (allowance.lt(amountIn)) {
    await (
      await inputTokenContract.approve(uniswapRouterContract.address, amountIn)
    ).wait()
  }

  const swapTx = await (isSellOrder
    ? await uniswapRouterContract.swapExactTokensForTokens(
        amountIn,
        amountOut,
        path,
        userAddr,
        deadline
      )
    : await uniswapRouterContract.swapTokensForExactTokens(
        amountOut,
        amountIn,
        path,
        userAddr,
        deadline
      )
  ).wait()
}

async function getChainId(): Promise<number> {
  return (await hardhat.ethers.provider.getNetwork()).chainId
}
