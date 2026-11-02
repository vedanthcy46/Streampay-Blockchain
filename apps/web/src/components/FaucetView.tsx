"use client";

import React, { useState } from "react";
import { useWriteContract, useChainId, useReadContract, useAccount } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { Coins, CheckCircle2, AlertCircle, Copy } from "lucide-react";
import { CONTRACT_ADDRESSES, LOCAL_HARDHAT_CHAIN_ID } from "@/lib/chain/config";
import { MOCK_USDC_ABI } from "@/lib/chain/abis";

interface FaucetViewProps {
  currentAddress: string;
}

export function FaucetView({ currentAddress }: FaucetViewProps) {
  const chainId = useChainId();
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] ||
    CONTRACT_ADDRESSES[LOCAL_HARDHAT_CHAIN_ID];

  const { isConnected } = useAccount();

  const [dripAmount, setDripAmount] = useState("5000"); // 5,000 mUSDC
  const [isDripping, setIsDripping] = useState(false);
  const [successTx, setSuccessTx] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedContract, setCopiedContract] = useState<string | null>(null);

  const { data: balance, refetch } = useReadContract({
    address: addresses.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: [currentAddress as `0x${string}`],
  });

  const { writeContractAsync } = useWriteContract();

  const handleFaucetDrip = async () => {
    try {
      setIsDripping(true);
      setErrorMsg(null);
      setSuccessTx(null);

      let tx: string;

      if (isConnected) {
        // Direct browser wallet signing
        const parsed = parseUnits(dripAmount, 6);
        tx = await writeContractAsync({
          address: addresses.mockUSDC,
          abi: MOCK_USDC_ABI,
          functionName: "faucet",
          args: [currentAddress as `0x${string}`, parsed],
        });
      } else {
        // Node-backed simulation for zero-config demonstration
        const res = await fetch("/api/faucet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipient: currentAddress, amount: dripAmount }),
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Faucet execution failed");
        }
        tx = data.txHash;
      }

      setSuccessTx(tx);
      await refetch();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.shortMessage ||
          err.message ||
          "Faucet drip failed. Make sure your local node is running (npx hardhat node) or connect a browser wallet."
      );
    } finally {
      setIsDripping(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContract(label);
    setTimeout(() => setCopiedContract(null), 2000);
  };

  const formattedBal = balance ? Number(formatUnits(balance, 6)).toLocaleString() : "0";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
              <Coins className="w-3.5 h-3.5" />
              <span>Academic Demo Faucet</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Mint Test Payment Tokens (mUSDC)
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mt-1.5 leading-relaxed">
              For evaluation and testing, you can mint up to 50,000 demonstration ERC-20 stablecoins (6 decimals) directly to your connected wallet or active persona. These tokens have no real monetary value and exist solely for payroll contract escrow simulation.
            </p>
          </div>
        </div>

        <div className="mt-8 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs text-slate-400">
              Current Balance for {currentAddress.slice(0, 6)}...{currentAddress.slice(-4)}:
            </span>
            <div className="text-3xl font-extrabold text-white mt-1">
              ${formattedBal} <span className="text-sm font-normal text-amber-400">mUSDC</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <input
              type="number"
              value={dripAmount}
              onChange={(e) => setDripAmount(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono w-32 focus:outline-none focus:border-amber-500"
              placeholder="5000"
            />
            <button
              onClick={handleFaucetDrip}
              disabled={isDripping}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {isDripping ? "Minting..." : "Claim Demo Tokens"}
            </button>
          </div>
        </div>

        {successTx && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Demo Tokens Successfully Minted!</p>
              <p className="text-[11px] text-emerald-400/80 break-all mt-0.5">
                Tx Hash: {successTx}
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Minting Failed</p>
              <p className="text-[11px] text-rose-400/80 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>

      {/* Contract Verification Info */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">Deployed Contract Addresses</h3>
        <p className="text-xs text-slate-400">
          Source code deployed and verifiable on Ethereum Sepolia / local testnet.
        </p>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-300">MockUSDC (ERC-20 Token)</div>
              <div className="font-mono text-slate-400 text-[11px] mt-0.5">
                {addresses.mockUSDC}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(addresses.mockUSDC, "MockUSDC")}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center space-x-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedContract === "MockUSDC" ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-300">PayrollStream (Escrow Contract)</div>
              <div className="font-mono text-slate-400 text-[11px] mt-0.5">
                {addresses.payrollStream}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(addresses.payrollStream, "PayrollStream")}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center space-x-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedContract === "PayrollStream" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
