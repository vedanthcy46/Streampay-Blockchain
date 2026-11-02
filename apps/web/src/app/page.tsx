"use client";

import React, { useState } from "react";
import { Navbar, DEMO_ACCOUNTS } from "@/components/Navbar";
import { EmployerDashboard } from "@/components/EmployerDashboard";
import { EmployeeDashboard } from "@/components/EmployeeDashboard";
import { FaucetView } from "@/components/FaucetView";
import { AuditView } from "@/components/AuditView";
import { useAccount } from "wagmi";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("employer");
  const [mockAddressOverride, setMockAddressOverride] = useState<string | undefined>(
    DEMO_ACCOUNTS[0].address
  );

  const { address: realAddress, isConnected } = useAccount();

  // If real wallet is connected and no override is set, use real wallet; otherwise use override or default employer
  const effectiveAddress = isConnected && !mockAddressOverride
    ? realAddress || DEMO_ACCOUNTS[0].address
    : mockAddressOverride || DEMO_ACCOUNTS[0].address;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mockAddressOverride={mockAddressOverride}
        setMockAddressOverride={setMockAddressOverride}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "employer" && (
          <EmployerDashboard currentAddress={effectiveAddress} />
        )}
        {activeTab === "employee" && (
          <EmployeeDashboard currentAddress={effectiveAddress} />
        )}
        {activeTab === "faucet" && (
          <FaucetView currentAddress={effectiveAddress} />
        )}
        {activeTab === "audit" && (
          <AuditView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-400">StreamPay</span> — Fundamentals of Blockchain Academic Project
          </div>
          <div>
            Sepolia Testnet / Local Hardhat EVM · Pull-based Discrete Settlement
          </div>
        </div>
      </footer>
    </div>
  );
}
