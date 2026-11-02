import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat, sepolia } from "viem/chains";
import { CONTRACT_ADDRESSES, LOCAL_HARDHAT_CHAIN_ID, SEPOLIA_CHAIN_ID } from "@/lib/chain/config";
import { MOCK_USDC_ABI, PAYROLL_STREAM_ABI } from "@/lib/chain/abis";

// Well-known Hardhat local private keys for zero-config demonstration
export const DEMO_PRIVATE_KEYS: Record<string, `0x${string}`> = {
  // Employer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266":
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  // Alice Employee: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
  "0x70997970c51812dc3a010c7d01b50e0d17dc79c8":
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  // Bob Employee: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
  "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc":
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
};

export const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(process.env.NEXT_PUBLIC_LOCAL_RPC_URL || "http://127.0.0.1:8545"),
});

export function getDemoWalletClient(address: string) {
  const normalized = address.toLowerCase();
  const pkey = DEMO_PRIVATE_KEYS[normalized] || DEMO_PRIVATE_KEYS["0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"];
  const account = privateKeyToAccount(pkey);

  return createWalletClient({
    account,
    chain: hardhat,
    transport: http(process.env.NEXT_PUBLIC_LOCAL_RPC_URL || "http://127.0.0.1:8545"),
  });
}
