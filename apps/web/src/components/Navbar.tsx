"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { injected } from "wagmi/connectors";
import { Wallet, ShieldCheck, Coins, RefreshCw, ChevronDown, Check } from "lucide-react";

export const DEMO_ACCOUNTS = [
  {
    role: "Employer",
    name: "Acme Web3 Labs (Employer)",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    badge: "Employer Escrow",
    color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  },
  {
    role: "Employee",
    name: "Alice Johnson (Employee)",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    badge: "Smart Contract Dev",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    role: "Employee",
    name: "Bob Vance (Employee)",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    badge: "Frontend Architect",
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  },
];

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mockAddressOverride?: string;
  setMockAddressOverride: (addr: string | undefined) => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  mockAddressOverride,
  setMockAddressOverride,
}: NavbarProps) {
  const { address: realAddress, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeEffectiveAddress = mockAddressOverride || realAddress;

  const currentAccountLabel =
    DEMO_ACCOUNTS.find(
      (a) => a.address.toLowerCase() === activeEffectiveAddress?.toLowerCase()
    )?.name ||
    (activeEffectiveAddress
      ? `${activeEffectiveAddress.slice(0, 6)}...${activeEffectiveAddress.slice(-4)}`
      : "Not Connected");

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("employer")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Coins className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                StreamPay
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Sepolia / Testnet
              </span>
            </div>
            <p className="text-xs text-slate-400">Programmable Salary Escrow</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab("employer")}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "employer"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Employer Portal
          </button>
          <button
            onClick={() => setActiveTab("employee")}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "employee"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Employee Stream Ticker
          </button>
          <button
            onClick={() => setActiveTab("faucet")}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "faucet"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            mUSDC Faucet
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "audit"
                ? "bg-slate-700 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Audit Log
          </button>
        </nav>

        {/* Wallet & Quick Switcher */}
        <div className="flex items-center space-x-3">
          {/* Demo Account Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-medium truncate max-w-[150px]">{currentAccountLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50">
                <div className="px-2 py-1.5 border-b border-slate-800 mb-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Fast Demo Role Switcher
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Switch demo test wallets or connect MetaMask
                  </p>
                </div>

                {DEMO_ACCOUNTS.map((acc) => {
                  const isCurrent =
                    activeEffectiveAddress?.toLowerCase() === acc.address.toLowerCase();
                  return (
                    <button
                      key={acc.address}
                      onClick={() => {
                        setMockAddressOverride(acc.address);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg mb-1 transition-all flex items-center justify-between text-xs ${
                        isCurrent
                          ? "bg-indigo-600/20 border border-indigo-500/40 text-white"
                          : "hover:bg-slate-800/80 text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                          <span>{acc.name}</span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400">
                          {acc.address.slice(0, 10)}...{acc.address.slice(-6)}
                        </p>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-indigo-400" />}
                    </button>
                  );
                })}

                <div className="border-t border-slate-800 pt-1 mt-1">
                  {isConnected ? (
                    <button
                      onClick={() => {
                        setMockAddressOverride(undefined);
                        disconnect();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-center py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      Disconnect Real Wallet
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        connect({ connector: injected() });
                        setMockAddressOverride(undefined);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-center py-1.5 rounded-lg text-xs font-medium text-indigo-400 hover:bg-indigo-500/10 transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      <span>Connect MetaMask (Sepolia)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
