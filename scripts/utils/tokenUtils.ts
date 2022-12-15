import * as ethers from "ethers"
import * as hardhat from "hardhat"

import * as IUniswapV2ERC20 from "@uniswap/v2-core/build/IUniswapV2ERC20.json"
import * as IUniswapV2Router from "@uniswap/v2-periphery/build/IUniswapV2Router02.json"
import * as IUniswapV2Factory from "@uniswap/v2-periphery/build/IUniswapV2Factory.json"
import * as IUniswapV2Pair from "@uniswap/v2-periphery/build/IUniswapV2Pair.json"
import * as IWETH from "@uniswap/v2-periphery/build/IWETH.json"

import * as IUniswapV3Router from "@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json"
import * as IUniswapV3Factory from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json"
import * as IUniswapV3Pool from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json"
import * as IUniswapV3ERC20 from "@uniswap/v3-core/artifacts/contracts/interfaces/IERC20Minimal.sol/IERC20Minimal.json"

/*********************************
 *      External Functions       *
 *********************************/

// Transfer ETH to user from Hardhat accounts
export async function getEthFromHardhatAccounts(
  user: ethers.Signer,
  amount: ethers.BigNumberish
): Promise<void> {
  const accounts = await hardhat.ethers.getSigners()
  const userAddr = await user.getAddress()
  for (let i = 0; i < 20; i++) {
    const accountBalance = await accounts[i].getBalance()
    if (accountBalance.gte(amount)) {
      // Transfer ETH to user
      await accounts[i].sendTransaction({
        to: userAddr,
        value: amount.toString(),
      })
      return
    }
  }
  throw new Error("Not enough eth to transfer")
}

// Approve token to spender
export async function approveToken(
  user: ethers.Signer,
  spender: string,
  token: string,
  amount: ethers.BigNumberish
): Promise<void> {
  // Format addresses
  const tokenAddr = ethers.utils.getAddress(token)
  const spenderAddr = ethers.utils.getAddress(spender)

  // Create contract instances with user signature
  const tokenContract = new hardhat.ethers.Contract(
    tokenAddr,
    IUniswapV2ERC20.abi,
    user
  )
  // Approve token to spender
  const response = await tokenContract.approve(spenderAddr, amount.toString())
}

// Swap ETH to WETH via WETH contract
export async function swapWeth(
  user: ethers.Signer,
  weth: string,
  amount: ethers.BigNumberish
): Promise<void> {
  // Get user info from signer
  const provider = user.provider ? user.provider : hardhat.ethers.provider

  // Only Mainnet or Arbitrum network can swap
  await checkNetwork(provider)

  // Format addresses
  const wethAddr = ethers.utils.getAddress(weth)

  // Create WETH contract instances with user signature
  const erc20Contract = new ethers.Contract(wethAddr, IWETH.abi, user)
  // Swap ETH to WETH
  const tx = (
    await erc20Contract.deposit({
      value: amount.toString(),
    })
  ).wait()
}

// Swap Tokens via Uniswap V2 contract
// Reference from https://github.com/thegostep/uniswap-v2-helper
// Add module before using: yarn add --dev @uniswap/v2-core @uniswap/v2-periphery
export async function swapToken(
  user: ethers.Signer,
  inputToken: string,
  outputToken: string,
  amount: ethers.BigNumberish
) {
  // Get user info from signer
  const provider = user.provider ? user.provider : hardhat.ethers.provider
  const userAddr = await user.getAddress()

  // Only Mainnet or Arbitrum network can swap
  await checkNetwork(provider)

  // Max settlement time in seconds
  const maxDelay = 60 * 2
  // True if amount is input token, false if amount is output token
  const isSellOrder = true
  // Frontrunning tolerance
  const maxSlippage = 100

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
  console.log("outputTokenContract:", outputTokenContract.address)
  console.log("factoryAddr:", await uniswapRouterContract.factory())

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

  // Format token amount
  const inputAmount = ethers.BigNumber.from(amount) // = ethers.utils.parseUnits(amount, await inputTokenContract.decimals())
  const outputAmount = ethers.BigNumber.from(amount) // = ethers.utils.parseUnits(amount, await outputTokenContract.decimals())

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

  // Get token order
  const inputIs0 = (await pairContract.token0()) === inputTokenContract.address

  // Get quotes
  const { reserve0, reserve1 } = await pairContract.getReserves()

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

  // Check sufficient balance
  const balance = await inputTokenContract.balanceOf(userAddr)
  if (balance.lt(amountIn)) {
    throw new Error("insufficient balance")
  }

  // Check sufficient allowance
  const allowance = await inputTokenContract.allowance(
    userAddr,
    uniswapRouterContract.address
  )

  if (allowance.lt(amountIn)) {
    await (
      await inputTokenContract.approve(uniswapRouterContract.address, amountIn)
    ).wait()
  }

  // Swap tokens
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

/*********************************
 *      Internal Functions       *
 *********************************/

async function checkNetwork(
  provider: ethers.ethers.providers.Provider
): Promise<void> {
  const chainId = (await provider.getNetwork()).chainId
  if (chainId !== 1 && chainId !== 42161) {
    throw new Error("Not Mainnet or Arbitrum network")
  }
}

async function tryFindPool(
  factoryContract: ethers.ethers.Contract,
  token0: string,
  token1: string
): Promise<string> {
  // Format token addresses
  const token0Addr = ethers.utils.getAddress(token0)
  const token1Addr = ethers.utils.getAddress(token1)

  // Try to find pool
  for (let i = 0; i <= 30; i++) {
    const poolAddress = await factoryContract.getPool(
      token0Addr,
      token1Addr,
      ethers.BigNumber.from(1000).mul(i) // Try to get 0.1% * i pool
    )
    if (poolAddress !== "0x0000000000000000000000000000000000000000") {
      console.log("Find ", (i * 0.1).toFixed(1).toString(), "% pool")
      return poolAddress
    }
  }
  throw new Error("Can not find pool")
}
