import { http, createConfig } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";

export const LOCAL_HARDHAT_CHAIN_ID = 31337;
export const SEPOLIA_CHAIN_ID = 11155111;

// Default addresses (updated via env or deployment)
export const CONTRACT_ADDRESSES = {
  // Local Hardhat default addresses from scripts/deploy.ts
  [LOCAL_HARDHAT_CHAIN_ID]: {
    mockUSDC: (process.env.NEXT_PUBLIC_LOCAL_MOCK_USDC_ADDRESS ||
      "0x5FbDB2315678afecb367f032d93F642f64180aa3") as `0x${string}`,
    payrollStream: (process.env.NEXT_PUBLIC_LOCAL_PAYROLL_STREAM_ADDRESS ||
      "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512") as `0x${string}`,
    chainlinkUsdInrFeed: undefined,
  },
  // Sepolia Testnet addresses
  [SEPOLIA_CHAIN_ID]: {
    mockUSDC: (process.env.NEXT_PUBLIC_SEPOLIA_MOCK_USDC_ADDRESS ||
      "0x0000000000000000000000000000000000000000") as `0x${string}`,
    payrollStream: (process.env.NEXT_PUBLIC_SEPOLIA_PAYROLL_STREAM_ADDRESS ||
      "0x0000000000000000000000000000000000000000") as `0x${string}`,
    // Chainlink Data Feed on Sepolia (ETH/USD or illustrative USD conversion)
    chainlinkUsdInrFeed: (process.env.NEXT_PUBLIC_CHAINLINK_FEED_ADDRESS ||
      "0x694AA1769357215DE4FAC081bf1f309aDC325306") as `0x${string}`,
  },
} as const;

export const wagmiConfig = createConfig({
  chains: [hardhat, sepolia],
  transports: {
    [hardhat.id]: http("http://127.0.0.1:8545"),
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.org"
    ),
  },
  ssr: true,
});
