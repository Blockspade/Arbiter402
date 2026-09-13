import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const HEDERA_RPC_URL = process.env.HEDERA_RPC_URL || "https://testnet.hashio.io/api";
const HEDERA_EVM_PRIVATE_KEY = process.env.HEDERA_EVM_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  sourcify: {
    enabled: true,
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    hedera_testnet: {
      url: HEDERA_RPC_URL,
      chainId: 296,
      accounts: HEDERA_EVM_PRIVATE_KEY ? [HEDERA_EVM_PRIVATE_KEY] : [],
      timeout: 100000,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./contracts/test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
