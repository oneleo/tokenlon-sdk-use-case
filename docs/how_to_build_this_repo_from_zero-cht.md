# 0、目錄

- [0、目錄](#0目錄)
- [1、下載 tokenlon-contracts-lib-js 並執行測試](#1下載-tokenlon-contracts-lib-js-並執行測試)
  - [（1）複製及編譯專案](#1複製及編譯專案)
  - [（2）複製及編譯環境變數（For Mainnet）](#2複製及編譯環境變數for-mainnet)
  - [（3）執行 For Mainnet 測試案例與結果輸出](#3執行-for-mainnet-測試案例與結果輸出)
  - [（4）複製及編譯環境變數（For Arbitrum）](#4複製及編譯環境變數for-arbitrum)
  - [（5）執行 For Arbitrum 測試案例與結果輸出](#5執行-for-arbitrum-測試案例與結果輸出)
- [2、建立空專案](#2建立空專案)
  - [（1）初始化專案](#1初始化專案)
  - [（2）編輯 Prettier 風格檔](#2編輯-prettier-風格檔)
  - [（3）編輯 Hardhat Fork 網路設定檔](#3編輯-hardhat-fork-網路設定檔)
  - [（4）建立 Hardhat Fork 網路用作弊工具](#4建立-hardhat-fork-網路用作弊工具)
  - [（5）建立合約地址簿 addresses.ts](#5建立合約地址簿-addressests)
  - [（6）下載、建立及編譯相關合約](#6下載建立及編譯相關合約)
- [3、建立使用 Tokenlon SDK 範例（For Mainnet）](#3建立使用-tokenlon-sdk-範例for-mainnet)
  - [（1）調整專案參數以符合 Mainnet 網路](#1調整專案參數以符合-mainnet-網路)
  - [（2）AMMWrapper via Tokenlon SDK](#2ammwrapper-via-tokenlon-sdk)
  - [（3）AMMWrapperWithPath via Tokenlon SDK](#3ammwrapperwithpath-via-tokenlon-sdk)
  - [（4）RFQ via Tokenlon SDK](#4rfq-via-tokenlon-sdk)
- [4、建立使用 Tokenlon SDK 範例（For Arbitrum）](#4建立使用-tokenlon-sdk-範例for-arbitrum)
  - [（1）調整專案參數以符合 Arbitrum 網路](#1調整專案參數以符合-arbitrum-網路)
  - [（2）LimitOrder via Tokenlon SDK](#2limitorder-via-tokenlon-sdk)
- [5、參考資料](#5參考資料)

# 1、下載 tokenlon-contracts-lib-js 並執行測試

## （1）複製及編譯專案

```bash
% git clone git@github.com:consenlabs/tokenlon-contracts-lib-js.git
% code tokenlon-contracts-lib-js/
% yarn install && yarn run build && yarn run compile-sol
```

## （2）複製及編譯環境變數（For Mainnet）

```bash
% cp .env.example .env
% code .env

### Edit .env
### --------------------------------------------------
CHAIN_ID="1" # e.g., 1 (mainnet), 42161 (arbitrum)
FORK_NODE_RPC_URL="https://eth-mainnet.alchemyapi.io/v2/<YOUR_ALCHEMY_API_KEY>"
FORK_BLOCK_NUMBER="14995000"
### --------------------------------------------------
```

## （3）執行 For Mainnet 測試案例與結果輸出

```bash
### 執行 For Mainnet 測試案例
% yarn run test
```

![](images/icons/grey_arrow_down.png)執行結果

```bash
yarn run v1.22.19
$ hardhat test

  AMMWrapper
    ✔ Should sign and encode valid order (12314ms)
    ✔ Should sign and encode valid order for ERC1271 wallet (1228ms)
    ✔ Should sign and encode valid order for ERC1271 wallet by ETHSign (177ms)

  AMMWrapperWithPath
    ✔ Should sign and encode valid Uniswap v2 order (350ms)
    ✔ Should sign and encode valid Uniswap v2 order for ERC1271 wallet (347ms)
    ✔ Should sign and encode valid Uniswap v2 order for ERC1271 wallet by ETHSign (115ms)
    ✔ Should sign and encode valid Uniswap v3 single hop order (3172ms)
    ✔ Should sign and encode valid Uniswap v3 multi hops order (114ms)
    ✔ Should sign and encode valid Curve v1 order (13882ms)

  RFQ
    ✔ Should sign and encode valid order (3958ms)
    ✔ Should sign and encode valid order for ERC1271 wallet (1120ms)
    ✔ Should sign and encode valid order for ERC1271 wallet by ETHSign (109ms)

  12 passing (37s)

✨  Done in 45.08s.
```

## （4）複製及編譯環境變數（For Arbitrum）

```bash
% cp .env.example .env
% code .env

### Edit .env
### --------------------------------------------------
CHAIN_ID="42161" # e.g., 1 (mainnet), 42161 (arbitrum)
FORK_NODE_RPC_URL="https://arb-mainnet.g.alchemy.com/v2/<YOUR_ALCHEMY_API_KEY>"
FORK_BLOCK_NUMBER="18000000"
### --------------------------------------------------
```

## （5）執行 For Arbitrum 測試案例與結果輸出

```bash
### 執行 For Arbitrum 測試案例
% yarn run test
```

![](images/icons/grey_arrow_down.png)執行結果

```bash
yarn run v1.22.19
$ hardhat test

  LimitOrder
    fillLimitOrderByTrader
      ✔ Should sign and encode valid order (9960ms)
      ✔ Should sign and encode valid order for ERC1271 wallet (1681ms)
      ✔ Should sign and encode valid order for ERC1271 wallet by ETHSign (1760ms)
    fillLimitOrderByProtocol
      ✔ Should sign and encode valid Sushiswap order (5429ms)
      ✔ Should sign and encode valid Uniswap v3 order (5264ms)
      ✔ Should sign and encode valid Uniswap v3 order for ERC1271 wallet (1087ms)
      ✔ Should sign and encode valid Uniswap v3 order for ERC1271 wallet by ETHSign (1212ms)
    cancelLimitOrder
      ✔ Should sign and encode valid cancel order

  8 passing (55s)

✨  Done in 61.23s.
```

# 2、建立空專案

## （1）初始化專案

```bash
### 初始化專案
% mkdir -p tokenlon-sdk && code tokenlon-sdk/
% yarn init --yes && yarn add --dev dotenv hardhat @tokenlon/contracts-lib @openzeppelin/contracts@3.4.2-solc-0.7
### yarn init --yes && yarn add --dev dotenv hardhat tsconfig-paths @tokenlon/contracts-lib @nomiclabs/hardhat-waffle @openzeppelin/contracts
% npx hardhat

### 設置新 hardhat 範例
### --------------------------------------------------
✔ What do you want to do? · Create a TypeScript project
✔ Hardhat project root: · /Users/user/Github/tokenlon-sdk
✔ Do you want to add a .gitignore? (Y/n) · y
✔ Do you want to install this sample project's dependencies with yarn (…)? (Y/n) · y
## --------------------------------------------------
```

## （2）編輯 Prettier 風格檔

```bash
% touch .prettierrc.json && code .prettierrc.json

### 編輯 .prettierrc.json
### --------------------------------------------------
{
  "semi": false
}
### --------------------------------------------------
```

## （3）編輯 Hardhat Fork 網路設定檔

```shell
% touch hardhat.config.ts && code hardhat.config.ts

### Edit hardhat.config.ts
### --------------------------------------------------
import "dotenv/config"
import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"

const accounts = {
  mnemonic:
    process.env.MNEMONIC ||
    "test test test test test test test test test test test junk",
  accountsBalance: "1000000000000000000000000",
}

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: parseInt(process.env.CHAIN_ID ?? "0", 10),
      accounts,
      forking: {
        url: process.env.FORK_NODE_RPC_URL ?? "",
        blockNumber: parseInt(process.env.FORK_BLOCK_NUMBER ?? "0", 10),
      },
    },
  },
  solidity: "0.7.6",
}

export default config
### --------------------------------------------------
```

## （4）建立 Hardhat Fork 網路用工具

```typescript
% mkdir -p scripts/utils
% touch scripts/utils/cheatcodes.ts && code scripts/utils/cheatcodes.ts
```

![](images/icons/grey_arrow_down.png)建立 Hardhat Fork 網路用工具範例

```typescript
import {
  impersonateAccount,
  stopImpersonatingAccount,
} from "@nomicfoundation/hardhat-network-helpers"

/*********************************
 *      External Functions       *
 *********************************/

export const impersonate = impersonateAccount
export const stopImpersonate = stopImpersonatingAccount
```

## （5）建立 Swap tokens 工具

```typescript
% touch scripts/utils/tokenUtils.ts && code scripts/utils/tokenUtils.ts
```

![](images/icons/grey_arrow_down.png)建立 Token swap 工具範例

```typescript
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

// Swap Tokens via Uniswap V3 contract
// Reference from https://youtu.be/vXu5GeLP6A8
// Add module before using: yarn add --dev @uniswap/v3-core @uniswap/v3-periphery
export async function swapTokenV3(
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

  // Format token addresses
  const inputTokenAddr = ethers.utils.getAddress(inputToken)
  const outputTokenAddr = ethers.utils.getAddress(outputToken)

  // Create contract instances with user signature
  const inputTokenContract = new hardhat.ethers.Contract(
    inputTokenAddr,
    IUniswapV3ERC20.abi,
    user
  )
  const uniswapRouterAddr = "0xE592427A0AEce92De3Edee1F18E0157C05861564"
  const uniswapRouterContract = new hardhat.ethers.Contract(
    uniswapRouterAddr,
    IUniswapV3Router.abi,
    user
  )

  // Create contract instances with provider only
  const uniswapFactoryAddr = "0x1F98431c8aD98523631AE4a59f267346ea31F984"
  const factoryContract = new hardhat.ethers.Contract(
    uniswapFactoryAddr,
    IUniswapV3Factory.abi,
    provider
  )
  const poolContract = new hardhat.ethers.Contract(
    // Try to find low fee swap pool
    await tryFindV3Pool(factoryContract, inputToken, outputToken),
    IUniswapV3Pool.abi,
    provider
  )

  // Get pool slot state
  const poolFee = await poolContract.fee()

  // Format token amount
  const inputAmount = ethers.BigNumber.from(amount)

  // Set swap deadline
  const currentTimestamp = (await provider.getBlock("latest")).timestamp
  const deadline = currentTimestamp + maxDelay

  // Check sufficient balance
  const balance = await inputTokenContract.balanceOf(userAddr)
  if (balance.lt(inputAmount)) {
    throw new Error("insufficient balance")
  }

  // Check sufficient allowance
  const allowance = await inputTokenContract.allowance(
    userAddr,
    uniswapRouterContract.address
  )
  if (allowance.lt(inputAmount)) {
    await (
      await inputTokenContract.approve(
        uniswapRouterContract.address,
        inputAmount
      )
    ).wait()
  }

  // Swap tokens
  const swapParams = {
    tokenIn: inputTokenAddr,
    tokenOut: outputTokenAddr,
    fee: poolFee,
    recipient: userAddr,
    deadline: deadline,
    amountIn: inputAmount,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  }
  const wsapTx = await uniswapRouterContract
    .connect(user)
    .exactInputSingle(swapParams)
}

// Swap Tokens via Uniswap V2 contract
// Reference from https://github.com/thegostep/uniswap-v2-helper
// Add module before using: yarn add --dev @uniswap/v2-core @uniswap/v2-periphery
export async function swapTokenV2(
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

async function tryFindV3Pool(
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
      console.log(
        "Tips: Find",
        (i * 0.1).toFixed(1).toString(),
        "% fee pool:",
        poolAddress
      )
      return poolAddress
    }
  }
  throw new Error("Can not find pool")
}
```

## （6）建立合約地址簿 addresses.ts

```bash
% mkdir -p scripts/utils
% touch scripts/utils/addresses.ts && code scripts/utils/addresses.ts
```

![](images/icons/grey_arrow_down.png)合約地址簿範例

```typescript
export const mainnetAddr = {
  // Token
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",

  // Token decimals
  DAIDecimals: "18",
  USDCDecimals: "6",
  USDTDecimals: "6",
  WETHDecimals: "18",

  // Tokenlon
  AllowanceTarget: "0x8A42d311D282Bfcaa5133b2DE0a8bCDBECea3073",
  AMMWrapper: "0x4a14347083B80E5216cA31350a2D21702aC3650d",
  AMMWrapperWithPath: "0x4a14347083B80E5216cA31350a2D21702aC3650d",
  LimitOrder: "",
  RFQ: "0xfD6C2d2499b1331101726A8AC68CCc9Da3fAB54F",
  UserProxy: "0x03f34bE1BF910116595dB1b11E9d1B2cA5D59659",

  // Uniswap
  UniswapV2Router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  UniswapV3Quoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  UniswapV3Router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",

  // Sushiswap
  SushiswapRouter: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",

  // Curve
  Curve3Pool: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
}

export const arbitrumAddr = {
  // Token
  DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
  USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
  USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",

  // Token decimals
  DAIDecimals: "18",
  USDCDecimals: "6",
  USDTDecimals: "6",
  WETHDecimals: "18",

  // Tokenlon
  AllowanceTarget: "0x413eCcE5d56204962090eEF1deaD4c0a247e289B",
  AMMWrapper: "",
  AMMWrapperWithPath: "",
  LimitOrder: "0xdC842f306d05Fc0e3A2469976ab860B453Af2D1A",
  RFQ: "",
  UserProxy: "0x0dCd8690730A3Bd2cfC46976B01B5905E8269ad4",

  // Uniswap
  UniswapV2Router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  UniswapV3Quoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  UniswapV3Router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",

  // Sushiswap
  SushiswapRouter: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",

  // Curve
  Curve3Pool: "",
}
```

## （7）下載、建立及編譯相關合約

### 7.1、下載相關 Interface 合約

```bash
% mkdir -p contracts/interfaces
```

![](images/icons/grey_arrow_down.png)下載相關 Interface 合約範例

- 下載 Interface 合約範例

```bash
### Curve from Tokenlon latest version
% curl -o contracts/interfaces/ICurveFi.sol -LJO https://github.com/consenlabs/tokenlon-contracts/raw/master/contracts/interfaces/ICurveFi.sol

### Token from openzeppelin v3.4.2-solc-0.7
% curl -o contracts/interfaces/IERC20.sol -LJO https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v3.4.2-solc-0.7/contracts/token/ERC20/IERC20.sol

### Tokenlon latest version
% curl -o contracts/interfaces/IAMMWrapper.sol -LJO https://raw.githubusercontent.com/consenlabs/tokenlon-contracts/master/contracts/interfaces/IAMMWrapper.sol && \
curl -o contracts/interfaces/IAMMWrapperWithPath.sol -LJO https://raw.githubusercontent.com/consenlabs/tokenlon-contracts/master/contracts/interfaces/IAMMWrapperWithPath.sol && \
curl -o contracts/interfaces/ILimitOrder.sol -LJO https://raw.githubusercontent.com/consenlabs/tokenlon-contracts/master/contracts/interfaces/ILimitOrder.sol && \
curl -o contracts/interfaces/IStrategyBase.sol -LJO https://raw.githubusercontent.com/consenlabs/tokenlon-contracts/master/contracts/interfaces/IStrategyBase.sol && \
curl -o contracts/interfaces/IAllowanceTarget.sol -LJO https://raw.githubusercontent.com/consenlabs/tokenlon-contracts/master/contracts/interfaces/IAllowanceTarget.sol && \
curl -o contracts/interfaces/IRFQ.sol -LJO https://raw.githubusercontent.com/consenlabs/tokenlon-contracts/master/contracts/interfaces/IRFQ.sol && \
curl -o contracts/interfaces/IERC1271Wallet.sol -LJO https://raw.githubusercontent.com/consenlabs/tokenlon-contracts/master/contracts/interfaces/IERC1271Wallet.sol

### Uniswap from Tokenlon latest version
% curl -o contracts/interfaces/IUniswapRouterV2.sol -LJO https://raw.githubusercontent.com/consenlabs/tokenlon-contracts/master/contracts/interfaces/IUniswapRouterV2.sol && \
curl -o contracts/interfaces/IUniswapV3Quoter.sol -LJO https://raw.githubusercontent.com/consenlabs/tokenlon-contracts/master/contracts/interfaces/IUniswapV3Quoter.sol && \
curl -o contracts/interfaces/IUniswapV3SwapRouter.sol -LJO https://raw.githubusercontent.com/consenlabs/tokenlon-contracts/master/contracts/interfaces/IUniswapV3SwapRouter.sol && \
curl -o contracts/interfaces/IUniswapV3SwapCallback.sol -LJO https://raw.githubusercontent.com/consenlabs/tokenlon-contracts/master/contracts/interfaces/IUniswapV3SwapCallback.sol
```

- 編輯 LimitOrder Interface 合約，在最下方增加必要 external 函式

```bash
% code contracts/interfaces/ILimitOrder.sol
```

```typescript
（…前略）
    /// @notice Set new coordinator
    /// @notice Only operator can call
    function upgradeCoordinator(address _newCoordinator) external;

    function coordinator() external view returns (address);

    function operator() external view returns (address);
}
```

### 7.2、下載相關 utils 合約

```bash
% mkdir -p contracts/utils
```

![](images/icons/grey_arrow_down.png)下載相關 utils 合約範例

```bash
### Tokenlon latest version
% curl -o contracts/utils/AMMLibEIP712.sol -LJO https://raw.githubusercontent.com/consenlabs/tokenlon-contracts/master/contracts/utils/AMMLibEIP712.sol && \
curl -o contracts/utils/LimitOrderLibEIP712.sol -LJO https://raw.githubusercontent.com/consenlabs/tokenlon-contracts/master/contracts/utils/LimitOrderLibEIP712.sol && \
curl -o contracts/utils/RFQLibEIP712.sol -LJO https://raw.githubusercontent.com/consenlabs/tokenlon-contracts/master/contracts/utils/RFQLibEIP712.sol && \
curl -o contracts/utils/BaseLibEIP712.sol -LJO https://raw.githubusercontent.com/consenlabs/tokenlon-contracts/master/contracts/utils/BaseLibEIP712.sol && \
curl -o contracts/utils/SignatureValidator.sol -LJO https://raw.githubusercontent.com/consenlabs/tokenlon-contracts/master/contracts/utils/SignatureValidator.sol && \
curl -o contracts/utils/LibBytes.sol -LJO https://raw.githubusercontent.com/consenlabs/tokenlon-contracts/master/contracts/utils/LibBytes.sol
```

### 7.3、建立 IUserProxy.sol 合約

```bash
### 建立 IUserProxy.sol 檔
% touch contracts/interfaces/IUserProxy.sol && code contracts/interfaces/IUserProxy.sol
```

![](images/icons/grey_arrow_down.png)建立 IUserProxy.sol 合約範例

```typescript
// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

interface IUserProxy {
    function toAMM(bytes calldata _payload) external payable;

    function toLimitOrder(bytes calldata _payload) external payable;

    function toRFQ(bytes calldata _payload) external payable;
}
```

### 7.4、編譯所有合約

```bash
### 因 Hardhat 範例合約與 Tokenlon SDK 編譯版本不同，故需刪除此範例合約
% mv contracts/Lock.sol contracts/Lock.sol.bak

### 編譯所有合約
% npx hardhat compile --show-stack-traces --force
```

# 3、建立使用 Tokenlon SDK 範例（For Mainnet）

## （1）調整專案參數以符合 Mainnet 網路

- 建置環境變數檔

```bash
% touch .env && code .env

### Edit .env
### --------------------------------------------------
CHAIN_ID="1" # e.g., 1 (mainnet), 42161 (arbitrum)
FORK_NODE_RPC_URL="https://eth-mainnet.alchemyapi.io/v2/<YOUR_ALCHEMY_API_KEY>"
FORK_BLOCK_NUMBER="14995000"
### --------------------------------------------------
```

## （2）AMMWrapper via Tokenlon SDK

- 編輯 scripts/ammwrapper_eoa_via_sdk.ts 檔

```bash
% touch scripts/ammwrapper_eoa_via_sdk.ts && code scripts/ammwrapper_eoa_via_sdk.ts
```

![](images/icons/grey_arrow_down.png)AMMWrapper via Tokenlon SDK 程式碼範例

```typescript
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
```

- 執行 scripts/ammwrapper_eoa_via_sdk.ts 範例

```bash
% npx hardhat run scripts/ammwrapper_eoa_via_sdk.ts
```

![](images/icons/grey_arrow_down.png)範例執行結果

- 執行結果

```bash
Chain id: 1
Network name: hardhat
Block number: 14995000
Block timestamp: 1655704684
Set the makerAddr to UniswapV2Router: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
Get makerAssetAmount from UniswapV2Router: 1075390205917469195418
Balance before transaction:
        User's WETH: 1000000000000000000
        User's DAI: 0
Complete the transaction of the AMMWrapper contract
Balance after transaction:
        User's WETH: 0
        User's DAI: 1075390205917469195418
```

- 執行說明

  - 透過 Tokenlon SDK 可快速地建立適用於 AMM 合約的 order 結構，以及針對 order 結構進行簽章
  - 使用 Tokenlon SDK 亦可便利地取得針對 AMMWrapper 合約的 trade() 函式執行的 payload
  - 確認建立的 payload 內容無誤後，可直接呼叫 UserProxy 合約的 toAMM() 函式執行 trade() 交易

## （3）AMMWrapperWithPath via Tokenlon SDK

- 編輯 scripts/ammwrapperwithpath_eoa_via_sdk.ts 檔

```bash
% touch scripts/ammwrapperwithpath_eoa_via_sdk.ts && code scripts/ammwrapperwithpath_eoa_via_sdk.ts
```

![](images/icons/grey_arrow_down.png)AMMWrapperWithPath via Tokenlon SDK 程式碼範例

```typescript
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
```

- 執行 scripts/ammwrapperwithpath_eoa_via_sdk.ts 範例

```bash
% npx hardhat run scripts/ammwrapperwithpath_eoa_via_sdk.ts
```

![](images/icons/grey_arrow_down.png)範例執行結果

- 執行結果

```bash
Chain id: 1
Network name: hardhat
Block number: 14995000
Block timestamp: 1655704684
Set the makerAddr to UniswapV2Router: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
Get makerAssetAmount from UniswapV2Router: 1075390205917469195418
Balance before transaction:
        User's WETH: 1000000000000000000
        User's DAI: 0
Complete the transaction of the AMMWrapperWithPath contract
Balance after transaction:
        User's WETH: 0
        User's DAI: 1075390205917469195418
```

- 執行說明

  - 透過 Tokenlon SDK 可快速地建立適用於 AMM 合約的 order 結構，以及針對 order 結構進行簽章
  - 使用 Tokenlon SDK 亦可便利地取得針對 AMMWrapperWithPath 合約的 trade() 函式執行的 payload
  - 確認建立的 payload 內容無誤後，可直接呼叫 UserProxy 合約的 toAMM() 函式執行 trade() 交易

## （4）RFQ via Tokenlon SDK

- 編輯 scripts/rfq_eoa_via_sdk.ts 檔

```bash
% touch scripts/rfq_eoa_via_sdk.ts && code scripts/rfq_eoa_via_sdk.ts
```

![](images/icons/grey_arrow_down.png)RFQ via Tokenlon SDK 程式碼範例

```typescript
import { Wallet } from "ethers"
import { ethers, network } from "hardhat"
import { mainnetAddr } from "./utils/addresses"
import * as tokenUtils from "./utils/tokenUtils"
import {
  RFQOrder,
  RFQFill,
  SignatureType,
  encodingHelper,
  signingHelper,
} from "@tokenlon/contracts-lib/v5"

const EXPIRY = Math.floor(Date.now() / 1000) + 86400
const ethUnit = ethers.utils.parseEther("1")
const wethUnit = ethers.utils.parseUnits("1.0", mainnetAddr.WETHDecimals)
const daiUnit = ethers.utils.parseUnits("1.0", mainnetAddr.DAIDecimals)

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
    await tokenUtils.getEthFromHardhatAccounts(user, ethUnit.mul(100))

    // Transfer 100 ETH to maker wallet
    const maker = Wallet.createRandom().connect(ethers.provider)
    await tokenUtils.getEthFromHardhatAccounts(maker, ethUnit.mul(100))

    // Set default order
    const defaultOrder: RFQOrder = {
      // Could override following fields at need in each case
      takerAddr: user.address,
      makerAddr: maker.address,
      takerAssetAddr: mainnetAddr.WETH,
      makerAssetAddr: mainnetAddr.DAI,
      takerAssetAmount: wethUnit.mul(1),
      makerAssetAmount: daiUnit.mul(1000),
      salt: signingHelper.generateRandomSalt(),
      deadline: EXPIRY,
      feeFactor: 0,
    }

    // Set maker order from defaultOrder
    const order = {
      ...defaultOrder,
    }

    // Swap ETH to WETH via WETH contract
    await tokenUtils.swapWeth(maker, mainnetAddr.WETH, wethUnit.mul(1))

    // Swap 1 WETH to DAI via Uniswap contract
    await tokenUtils.swapTokenV3(
      maker,
      mainnetAddr.WETH,
      mainnetAddr.DAI,
      wethUnit.mul(1)
    )

    // Approve transfer of makerAssetAddr permission to AllowanceTarget contract.
    await tokenUtils.approveToken(
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
```

- 執行 scripts/rfq_eoa_via_sdk.ts 範例

```bash
% npx hardhat run scripts/rfq_eoa_via_sdk.ts
```

![](images/icons/grey_arrow_down.png)範例執行結果

- 執行結果

```bash
Chain id: 1
Network name: hardhat
Block number: 14995000
Block timestamp: 1655704684
Tips: Find 0.3 % fee pool: 0xC2e9F25Be6257c210d7Adf0D4Cd6E3E881ba25f8
Balance before transaction:
        User's ETH: 100000000000000000000
        User's DAI: 0
        Maker's WETH: 0
        Maker's DAI: 1076723285035289096160
Complete the transaction of the RFQ contract
Balance after transaction:
        User's ETH: 98997168714640892082
        User's DAI: 1000000000000000000000
        Maker's WETH: 1000000000000000000
        Maker's DAI: 76723285035289096160
```

- 執行說明

  - 透過 Tokenlon SDK 可快速地建立適用於 RFQ 合約的 order 結構
  - 使用 Tokenlon SDK 亦可簡易地讓 taker 及 maker 針對 order 結構進行簽章
  - 透過 Tokenlon SDK 可便利地取得針對 RFQ 合約的 fill() 函式執行的 payload
  - 確認建立的 payload 內容無誤後，可直接呼叫 UserProxy 合約的 toRFQ() 函式執行 fill() 交易

# 4、建立使用 Tokenlon SDK 範例（For Arbitrum）

## （1）調整專案參數以符合 Arbitrum 網路

- 建置環境變數檔

```bash
% code .env

### Edit .env
### --------------------------------------------------
CHAIN_ID="42161" # e.g., 1 (mainnet), 42161 (arbitrum)
FORK_NODE_RPC_URL="https://arb-mainnet.g.alchemy.com/v2/<YOUR_ALCHEMY_API_KEY>"
FORK_BLOCK_NUMBER="18000000"
### --------------------------------------------------
```

## （2）LimitOrder via Tokenlon SDK

- 編輯 scripts/limitorder_eoa_via_sdk.ts 檔

```bash
% touch scripts/limitorder_eoa_via_sdk.ts && code scripts/limitorder_eoa_via_sdk.ts
```

![](images/icons/grey_arrow_down.png)LimitOrder via Tokenlon SDK 程式碼範例

```typescript
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
```

- 執行 scripts/limitorder_eoa_via_sdk.ts 範例

```bash
% npx hardhat run scripts/limitorder_eoa_via_sdk.ts
```

![](images/icons/grey_arrow_down.png)範例執行結果

- 執行結果

```bash
Chain id: 42161
Network name: hardhat
Block number: 18000000
Block timestamp: 1658219614
Get the operator of LimitOrder contract: 0x4aBEAEA1E76a81203521405aff8d8D128307fFaF
Complete replace new coordinator on chain: 0xC8aB76EFF66b523552D28bEA118F83FCA927E5Cc
Tips: Find 0.3 % fee pool: 0xA961F0473dA4864C5eD28e00FcC53a3AAb056c1b
Balance before transaction:
        Maker's WETH: 1000000000000000000
        Maker's DAI: 0
        User's WETH: 0
        User's DAI: 1513650316365103742286
Complete the transaction of the LimitOrder contract
Balance after transaction:
        Maker's WETH: 0
        Maker's DAI: 1000000000000000000000
        User's WETH: 1000000000000000000
        User's DAI: 513650316365103742286
```

- 執行說明

  - 透過 Tokenlon SDK 可快速建立適用於 LimitOrder 合約的 order 結構
  - 使用 Tokenlon SDK 亦可簡易地讓 taker 針對 order 結構進行簽章
  - 透過 Tokenlon SDK 可便利地取得 orderHash、allowFill，並讓 taker、coordinator 對其進行簽章
  - 使用 Tokenlon SDK 亦可輕鬆地取得針對 LimitOrder 合約的 fill() 函式執行的 payload
  - 確認建立的 payload 內容無誤後，可直接呼叫 UserProxy 合約的 toLimitOrder() 函式執行 fill() 交易

# 5、參考資料

- Github Repo of tokenlon-contracts-lib-js

  - [https://github.com/consenlabs/tokenlon-contracts-lib-js](https://github.com/consenlabs/tokenlon-contracts-lib-js)

- 本範例已整理至 oneleo/tokenlon-sdk-use-case repo

  - [https://github.com/oneleo/tokenlon-sdk-use-case](https://github.com/oneleo/tokenlon-sdk-use-case)
