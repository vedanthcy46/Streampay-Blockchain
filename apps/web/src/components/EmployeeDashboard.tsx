"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useChainId,
} from "wagmi";
import { formatUnits, parseUnits } from "viem";
import confetti from "canvas-confetti";
import {
  Wallet,
  ArrowDownCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Percent,
  Coins,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe,
} from "lucide-react";
import { CONTRACT_ADDRESSES, LOCAL_HARDHAT_CHAIN_ID } from "@/lib/chain/config";
import { PAYROLL_STREAM_ABI, MOCK_USDC_ABI } from "@/lib/chain/abis";
import { DEMO_ACCOUNTS } from "./Navbar";

interface EmployeeDashboardProps {
  currentAddress: string;
}

export function EmployeeDashboard({ currentAddress }: EmployeeDashboardProps) {
  const chainId = useChainId();
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] ||
    CONTRACT_ADDRESSES[LOCAL_HARDHAT_CHAIN_ID];

  // Currency conversion selection: USD, EUR, INR
  const [fiatCurrency, setFiatCurrency] = useState<"USD" | "EUR" | "INR">("USD");
  const FX_RATES = {
    USD: 1.0,
    EUR: 0.92,
    INR: 84.5,
  };

  const [streamId, setStreamId] = useState<number>(1);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [claimSuccessTx, setClaimSuccessTx] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live interpolated ticking counter state
  const [interpolatedClaimableNet, setInterpolatedClaimableNet] = useState<number>(0);
  const [interpolatedClaimableGross, setInterpolatedClaimableGross] = useState<number>(0);
  const [interpolatedTax, setInterpolatedTax] = useState<number>(0);

  // Read Employee's active stream list
  const { data: employeeStreamsData } = useReadContract({
    address: addresses.payrollStream,
    abi: PAYROLL_STREAM_ABI,
    functionName: "getStreamsByEmployee",
    args: [currentAddress as `0x${string}`],
  });

  // Read stream details
  const { data: streamData, refetch: refetchStream } = useReadContract({
    address: addresses.payrollStream,
    abi: PAYROLL_STREAM_ABI,
    functionName: "getStream",
    args: [BigInt(streamId)],
  });

  // Read claimable amounts from smart contract
  const { data: claimableData, refetch: refetchClaimable } = useReadContract({
    address: addresses.payrollStream,
    abi: PAYROLL_STREAM_ABI,
    functionName: "claimableAmounts",
    args: [BigInt(streamId)],
  });

  // Read employee's wallet token balance
  const { data: employeeWalletBalance, refetch: refetchWalletBal } = useReadContract({
    address: addresses.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: [currentAddress as `0x${string}`],
  });

  const { writeContractAsync } = useWriteContract();

  // If streams exist for employee, default to the latest one
  useEffect(() => {
    if (employeeStreamsData && Array.isArray(employeeStreamsData) && employeeStreamsData.length > 0) {
      const latestId = Number(employeeStreamsData[employeeStreamsData.length - 1]);
      setStreamId(latestId);
    }
  }, [employeeStreamsData]);

  // High-frequency live interpolation timer (updates every 80ms)
  useEffect(() => {
    if (!streamData) return;

    const stream = streamData as any;
    const totalGross = Number(formatUnits(stream.totalGrossFunded || BigInt(0), 6));
    const duration = Number(stream.duration || BigInt(1));
    const accumulatedActive = Number(stream.accumulatedActiveSeconds || BigInt(0));
    const lastCheckpoint = Number(stream.lastCheckpoint || BigInt(0));
    const netPaid = Number(formatUnits(stream.netPaid || BigInt(0), 6));
    const taxPaid = Number(formatUnits(stream.taxPaid || BigInt(0), 6));
    const taxBps = Number(stream.taxBps || BigInt(0));
    const status = Number(stream.status || 0);

    const interval = setInterval(() => {
      const currentNowSec = Date.now() / 1000;

      let activeElapsed = accumulatedActive;
      if (status === 1) { // ACTIVE
        const elapsedSinceCheckpoint = Math.max(0, currentNowSec - lastCheckpoint);
        activeElapsed = Math.min(duration, accumulatedActive + elapsedSinceCheckpoint);
      }

      const fraction = duration > 0 ? activeElapsed / duration : 0;
      const currentVestedGross = totalGross * Math.min(1, fraction);

      const cumulativeTax = (currentVestedGross * taxBps) / 10000;
      const cumulativeNet = currentVestedGross - cumulativeTax;

      const claimableNet = Math.max(0, cumulativeNet - netPaid);
      const claimableTax = Math.max(0, cumulativeTax - taxPaid);

      setInterpolatedClaimableNet(claimableNet);
      setInterpolatedClaimableGross(claimableNet + claimableTax);
      setInterpolatedTax(claimableTax);
    }, 80);

    return () => clearInterval(interval);
  }, [streamData]);

  // Handle Withdrawal
  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);
      setErrorMsg(null);
      setClaimSuccessTx(null);

      const tx = await writeContractAsync({
        address: addresses.payrollStream,
        abi: PAYROLL_STREAM_ABI,
        functionName: "withdraw",
        args: [BigInt(streamId)],
      });

      setClaimSuccessTx(tx);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#6366f1", "#38bdf8", "#f59e0b"],
        });
      } catch {}

      await refetchClaimable();
      await refetchStream();
      await refetchWalletBal();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.shortMessage || err.message || "Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const stream = streamData as any;
  const statusNumber = stream ? Number(stream.status) : 0;
  const statusLabel =
    statusNumber === 1
      ? "Streaming (Active)"
      : statusNumber === 2
      ? "Paused"
      : statusNumber === 3
      ? "Terminated"
      : statusNumber === 4
      ? "Completed"
      : "Pending";

  const walletBalFormatted = employeeWalletBalance
    ? Number(formatUnits(employeeWalletBalance, 6)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  const convertedValue = (interpolatedClaimableNet * FX_RATES[fiatCurrency]).toLocaleString(
    undefined,
    { minimumFractionDigits: 4, maximumFractionDigits: 4 }
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Wallet overview & currency converter toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Claimed Balance in Wallet</div>
            <div className="text-base font-bold text-white tracking-tight">
              ${walletBalFormatted} <span className="text-xs font-normal text-emerald-400">mUSDC</span>
            </div>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 text-xs">
          <Globe className="w-4 h-4 text-slate-400 ml-1" />
          <span className="text-[11px] text-slate-400 mr-1">Display Currency:</span>
          {(["USD", "EUR", "INR"] as const).map((curr) => (
            <button
              key={curr}
              onClick={() => setFiatCurrency(curr)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                fiatCurrency === curr
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Hero: Real-time Accrual Ticker Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl p-8 md:p-12 text-center">
        {/* Glow ambient effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Continuous Blockchain Entitlement Accrual</span>
          </div>

          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
            Net Claimable Salary
          </p>

          {/* Large Odometer-style Animated Number */}
          <div className="mt-3 font-mono text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
            ${interpolatedClaimableNet.toFixed(4)}
          </div>

          {/* Indicative Fiat conversion */}
          <p className="text-xs text-slate-400 mt-2 font-medium">
            ≈ {fiatCurrency === "INR" ? "₹" : fiatCurrency === "EUR" ? "€" : "$"}
            {convertedValue} {fiatCurrency}{" "}
            <span className="text-[10px] text-slate-500 font-normal">
              (Chainlink Reference Feed / Indicative FX)
            </span>
          </p>

          {/* Breakdown pill row */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
            <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Gross Accrued
              </span>
              <p className="text-base font-bold text-slate-200 mt-0.5">
                ${interpolatedClaimableGross.toFixed(4)} <span className="text-xs font-normal text-slate-400">mUSDC</span>
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Simulated Tax (10%)
              </span>
              <p className="text-base font-bold text-amber-400 mt-0.5">
                -${interpolatedTax.toFixed(4)} <span className="text-xs font-normal text-slate-400">to Treasury</span>
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Stream Status
              </span>
              <p className="text-base font-bold text-emerald-400 mt-0.5 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{statusLabel}</span>
              </p>
            </div>
          </div>

          {/* Big Action Button */}
          <div className="mt-8 max-w-md mx-auto">
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing || interpolatedClaimableNet <= 0}
              className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <ArrowDownCircle className={`w-5 h-5 ${isWithdrawing ? "animate-spin" : ""}`} />
              <span>
                {isWithdrawing
                  ? "Processing On-Chain Claim..."
                  : `Claim $${interpolatedClaimableNet.toFixed(2)} Net Salary`}
              </span>
            </button>
            <p className="text-[11px] text-slate-500 mt-2">
              Tokens transferred to your designated wallet via pull escrow. Tax automatically routed to company treasury.
            </p>
          </div>

          {/* Transaction Success Alert */}
          {claimSuccessTx && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300 max-w-md mx-auto text-left flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Salary Successfully Claimed!</p>
                <p className="text-[11px] text-emerald-400/80 mt-0.5 break-all">
                  Transaction Hash: {claimSuccessTx}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300 max-w-md mx-auto text-left flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Withdrawal Error</p>
                <p className="text-[11px] text-rose-400/80 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stream Agreement Specifications Card */}
      {stream && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Salary Agreement Details</h3>
              <p className="text-xs text-slate-400">
                Verified on-chain escrow parameters for stream #{streamId}.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              Stream #{streamId}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Employer Escrow</span>
              <p className="font-mono text-slate-300 mt-1 truncate">
                {stream.employer?.slice(0, 10)}...{stream.employer?.slice(-6)}
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-medium">Total Agreement Gross</span>
              <p className="font-semibold text-slate-200 mt-1">
                ${Number(formatUnits(stream.totalGrossFunded || BigInt(0), 6)).toLocaleString()} mUSDC
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-medium">Total Active Duration</span>
              <p className="text-slate-200 mt-1">
                {Number(stream.duration) >= 86400
                  ? `${Number(stream.duration) / 86400} days`
                  : Number(stream.duration) >= 3600
                  ? `${Number(stream.duration) / 3600} hours`
                  : `${Number(stream.duration) / 60} minutes`}
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-medium">Cumulative Claimed Net</span>
              <p className="font-semibold text-emerald-400 mt-1">
                ${Number(formatUnits(stream.netPaid || BigInt(0), 6)).toFixed(2)} mUSDC
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
