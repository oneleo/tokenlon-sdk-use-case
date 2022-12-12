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
