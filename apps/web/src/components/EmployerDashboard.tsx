"use client";

import React, { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import { formatUnits, parseUnits } from "viem";
import {
  Users,
  Play,
  Pause,
  StopCircle,
  PlusCircle,
  Clock,
  Coins,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { CONTRACT_ADDRESSES, LOCAL_HARDHAT_CHAIN_ID } from "@/lib/chain/config";
import { PAYROLL_STREAM_ABI, MOCK_USDC_ABI } from "@/lib/chain/abis";
import { DEMO_ACCOUNTS } from "./Navbar";

interface EmployerDashboardProps {
  currentAddress: string;
}

export function EmployerDashboard({ currentAddress }: EmployerDashboardProps) {
  const chainId = useChainId();
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] ||
    CONTRACT_ADDRESSES[LOCAL_HARDHAT_CHAIN_ID];

  // Component state
  const [employees, setEmployees] = useState<any[]>([]);
  const [streams, setStreams] = useState<any[]>([]);
  const [isLoadingStreams, setIsLoadingStreams] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);

  // Stream Creation Form
  const [selectedEmployee, setSelectedEmployee] = useState(DEMO_ACCOUNTS[1].address);
  const [grossAmount, setGrossAmount] = useState("3000"); // 3,000 mUSDC
  const [durationPreset, setDurationPreset] = useState("300"); // 300s = 5-minute board demo
  const [taxPercent, setTaxPercent] = useState("10"); // 10% = 1000 bps
  const [treasuryAddress, setTreasuryAddress] = useState(DEMO_ACCOUNTS[0].address);

  // New Employee Form
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("");
  const [newEmpWallet, setNewEmpWallet] = useState("");
  const [newEmpSalary, setNewEmpSalary] = useState("3000");

  // Approval and submission state
  const [isApproving, setIsApproving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Contract reads
  const { data: employerBalance, refetch: refetchBalance } = useReadContract({
    address: addresses.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: [currentAddress as `0x${string}`],
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: addresses.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: "allowance",
    args: [currentAddress as `0x${string}`, addresses.payrollStream],
  });

  const { writeContractAsync } = useWriteContract();

  // Fetch employees from database
  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      if (data.success && data.employees.length > 0) {
        setEmployees(data.employees);
      } else {
        // Fallback to demo accounts
        setEmployees([
          {
            id: "emp-1",
            name: "Alice Johnson",
            role: "Lead Smart Contract Engineer",
            walletAddress: DEMO_ACCOUNTS[1].address,
            salaryMonthly: 3000,
          },
          {
            id: "emp-2",
            name: "Bob Vance",
            role: "Full-Stack Web3 Architect",
            walletAddress: DEMO_ACCOUNTS[2].address,
            salaryMonthly: 4500,
          },
        ]);
      }
    } catch {
      // Fallback
    }
  };

  // Fetch streams from local backend or mock
  const fetchStreams = async () => {
    setIsLoadingStreams(true);
    try {
      const res = await fetch(`/api/streams?employer=${currentAddress}`);
      const data = await res.json();
      if (data.success && data.streams) {
        setStreams(data.streams);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingStreams(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchStreams();
  }, [currentAddress]);

  const { isConnected } = useAccount();

  // Handle Token Approval
  const handleApprove = async () => {
    try {
      setIsApproving(true);
      setStatusMessage("Requesting token approval...");
      const amountParsed = parseUnits(grossAmount, 6);

      let tx: string;
      if (isConnected) {
        tx = await writeContractAsync({
          address: addresses.mockUSDC,
          abi: MOCK_USDC_ABI,
          functionName: "approve",
          args: [addresses.payrollStream, amountParsed],
        });
      } else {
        const res = await fetch("/api/chain/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "APPROVE",
            caller: currentAddress,
            params: { amount: grossAmount },
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        tx = data.txHash;
      }

      setStatusMessage(`Approval confirmed: ${tx.slice(0, 10)}...`);
      await refetchAllowance();
      setStatusMessage("Token allowance approved successfully!");
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Approval error: ${err.shortMessage || err.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  // Handle Stream Creation
  const handleCreateStream = async () => {
    try {
      setIsSubmitting(true);
      setStatusMessage("Submitting createStream transaction...");

      const amountParsed = parseUnits(grossAmount, 6);
      const durationSec = BigInt(durationPreset);
      const taxBps = BigInt(Math.floor(Number(taxPercent) * 100));

      let tx: string;
      if (isConnected) {
        tx = await writeContractAsync({
          address: addresses.payrollStream,
          abi: PAYROLL_STREAM_ABI,
          functionName: "createStream",
          args: [
            selectedEmployee as `0x${string}`,
            addresses.mockUSDC,
            amountParsed,
            durationSec,
            taxBps,
            treasuryAddress as `0x${string}`,
          ],
        });
      } else {
        const res = await fetch("/api/chain/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "CREATE_STREAM",
            caller: currentAddress,
            params: {
              employeeAddress: selectedEmployee,
              grossAmount,
              durationSeconds: durationPreset,
              taxBps: Math.floor(Number(taxPercent) * 100),
              treasuryAddress,
            },
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        tx = data.txHash;
      }

      setStatusMessage(`Stream created successfully! Tx: ${tx.slice(0, 10)}...`);

      // Record off-chain projection
      await fetch("/api/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chainId,
          contractAddress: addresses.payrollStream,
          streamId: streams.length + 1,
          employerWallet: currentAddress,
          employeeWallet: selectedEmployee,
          status: "ACTIVE",
          totalGross: grossAmount,
          durationSeconds: Number(durationPreset),
          taxBps: Number(taxPercent) * 100,
          treasuryWallet: treasuryAddress,
          txHash: tx,
        }),
      });

      await fetchStreams();
      await refetchBalance();
      setShowCreateModal(false);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Creation error: ${err.shortMessage || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lifecycle actions: Pause
  const handlePause = async (streamId: number) => {
    try {
      setStatusMessage(`Pausing stream #${streamId}...`);
      let tx: string;
      if (isConnected) {
        tx = await writeContractAsync({
          address: addresses.payrollStream,
          abi: PAYROLL_STREAM_ABI,
          functionName: "pauseStream",
          args: [BigInt(streamId)],
        });
      } else {
        const res = await fetch("/api/chain/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "PAUSE_STREAM",
            caller: currentAddress,
            params: { streamId },
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        tx = data.txHash;
      }
      setStatusMessage(`Stream #${streamId} paused. Tx: ${tx.slice(0, 10)}...`);
      await fetchStreams();
    } catch (err: any) {
      alert(`Pause failed: ${err.shortMessage || err.message}`);
    }
  };

  // Lifecycle actions: Resume
  const handleResume = async (streamId: number) => {
    try {
      setStatusMessage(`Resuming stream #${streamId}...`);
      let tx: string;
      if (isConnected) {
        tx = await writeContractAsync({
          address: addresses.payrollStream,
          abi: PAYROLL_STREAM_ABI,
          functionName: "resumeStream",
          args: [BigInt(streamId)],
        });
      } else {
        const res = await fetch("/api/chain/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "RESUME_STREAM",
            caller: currentAddress,
            params: { streamId },
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        tx = data.txHash;
      }
      setStatusMessage(`Stream #${streamId} resumed. Tx: ${tx.slice(0, 10)}...`);
      await fetchStreams();
    } catch (err: any) {
      alert(`Resume failed: ${err.shortMessage || err.message}`);
    }
  };

  // Lifecycle actions: Terminate
  const handleTerminate = async (streamId: number) => {
    if (!confirm(`Are you sure you want to terminate stream #${streamId}? Unearned escrow funds will be immediately refunded to your employer wallet, while vested salary will stay reserved for the employee.`)) {
      return;
    }
    try {
      setStatusMessage(`Terminating stream #${streamId}...`);
      let tx: string;
      if (isConnected) {
        tx = await writeContractAsync({
          address: addresses.payrollStream,
          abi: PAYROLL_STREAM_ABI,
          functionName: "terminateStream",
          args: [BigInt(streamId)],
        });
      } else {
        const res = await fetch("/api/chain/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "TERMINATE_STREAM",
            caller: currentAddress,
            params: { streamId },
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        tx = data.txHash;
      }
      setStatusMessage(`Stream #${streamId} terminated. Unearned funds refunded. Tx: ${tx.slice(0, 10)}...`);
      await fetchStreams();
      await refetchBalance();
    } catch (err: any) {
      alert(`Termination failed: ${err.shortMessage || err.message}`);
    }
  };

  // Handle Add Employee
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newEmpName,
          role: newEmpRole,
          walletAddress: newEmpWallet,
          salaryMonthly: newEmpSalary,
          employerWallet: currentAddress,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchEmployees();
        setShowAddEmpModal(false);
        setNewEmpName("");
        setNewEmpRole("");
        setNewEmpWallet("");
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formattedBalance = employerBalance ? Number(formatUnits(employerBalance, 6)).toLocaleString() : "0";

  return (
    <div className="space-y-8">
      {/* Top Banner / Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Employer mUSDC Balance</span>
            <Coins className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2 tracking-tight">${formattedBalance} <span className="text-xs font-normal text-indigo-300">mUSDC</span></p>
          <div className="mt-3 flex items-center space-x-1 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Liquid wallet reserves</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Escrow Streams</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2 tracking-tight">
            {streams.filter((s) => s.status === "ACTIVE").length} <span className="text-xs font-normal text-slate-400">active</span>
          </p>
          <div className="mt-3 flex items-center space-x-1 text-[11px] text-slate-400">
            <span>{streams.length} total payroll agreements</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Registered Employees</span>
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2 tracking-tight">
            {employees.length} <span className="text-xs font-normal text-slate-400">onboarded</span>
          </p>
          <div className="mt-3 flex items-center space-x-1 text-[11px] text-slate-400">
            <span>Private HR metadata off-chain</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Contract Solvency</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2 tracking-tight">100% Prefunded</p>
          <div className="mt-3 flex items-center space-x-1 text-[11px] text-slate-400">
            <span>Guaranteed cryptographic escrow</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white">Payroll Stream Orchestration</h2>
          <p className="text-xs text-slate-400">
            Launch prefunded continuous salary streams with simulated tax withholding.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddEmpModal(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors border border-slate-700"
          >
            <PlusCircle className="w-4 h-4 text-slate-400" />
            <span>Add Employee Profile</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Create Funded Stream</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-800/80 text-xs text-indigo-200 flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-indigo-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Active Streams Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">Live Escrow Salary Streams</h3>
          <button
            onClick={fetchStreams}
            className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStreams ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {streams.length === 0 ? (
          <div className="p-12 text-center">
            <Coins className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-slate-300">No Salary Streams Created Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Click &quot;Create Funded Stream&quot; to deposit tokens into escrow and begin continuous per-second salary vesting.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-all shadow-md"
            >
              Start 5-Minute Demo Stream
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3">Stream ID</th>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Gross Funded</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Tax Withholding</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {streams.map((stream) => {
                  const empObj = employees.find(
                    (e) => e.walletAddress.toLowerCase() === stream.employeeWallet.toLowerCase()
                  );
                  return (
                    <tr key={stream.id || stream.streamId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-slate-300">
                        #{stream.streamId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{empObj?.name || "Designated Worker"}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {stream.employeeWallet.slice(0, 8)}...{stream.employeeWallet.slice(-6)}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-200">
                        ${Number(stream.totalGross).toLocaleString()} mUSDC
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {stream.durationSeconds >= 86400
                          ? `${stream.durationSeconds / 86400} days`
                          : stream.durationSeconds >= 3600
                          ? `${stream.durationSeconds / 3600} hours`
                          : `${stream.durationSeconds / 60} mins`}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {stream.taxBps / 100}% <span className="text-[10px] text-slate-500">(to Treasury)</span>
                      </td>
                      <td className="px-6 py-4">
                        {stream.status === "ACTIVE" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping" />
                            Streaming
                          </span>
                        )}
                        {stream.status === "PAUSED" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Paused
                          </span>
                        )}
                        {stream.status === "TERMINATED" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Terminated
                          </span>
                        )}
                        {stream.status === "COMPLETED" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {stream.status === "ACTIVE" && (
                          <button
                            onClick={() => handlePause(stream.streamId)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition-all"
                          >
                            Pause
                          </button>
                        )}
                        {stream.status === "PAUSED" && (
                          <button
                            onClick={() => handleResume(stream.streamId)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition-all"
                          >
                            Resume
                          </button>
                        )}
                        {(stream.status === "ACTIVE" || stream.status === "PAUSED") && (
                          <button
                            onClick={() => handleTerminate(stream.streamId)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-medium transition-all"
                          >
                            Terminate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee Directory Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Company Employee Directory</h3>
            <p className="text-xs text-slate-400">
              Private company HR records stored off-chain and linked to wallet addresses.
            </p>
          </div>
          <button
            onClick={() => setShowAddEmpModal(true)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            + Add Worker
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-100 text-sm">{emp.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {emp.role}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-2 truncate">
                  {emp.walletAddress}
                </p>
                <p className="text-xs font-medium text-emerald-400 mt-1">
                  ${emp.salaryMonthly?.toLocaleString()} mUSDC / mo
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedEmployee(emp.walletAddress);
                    setGrossAmount(String(emp.salaryMonthly || "3000"));
                    setShowCreateModal(true);
                  }}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                >
                  <span>Create Stream</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create Stream */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white">Create Salary Escrow Stream</h3>
            <p className="text-xs text-slate-400 mt-1">
              Prefund salary into smart contract escrow. Tokens vest continuously and can be withdrawn anytime by the employee.
            </p>

            <div className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.walletAddress} value={emp.walletAddress}>
                      {emp.name} ({emp.role}) - {emp.walletAddress.slice(0, 6)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Gross Stream Amount (mUSDC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={grossAmount}
                    onChange={(e) => setGrossAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="3000"
                  />
                  <span className="absolute right-3 top-2 text-slate-500 font-semibold">mUSDC</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Duration Preset</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDurationPreset("300")}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                      durationPreset === "300"
                        ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    5 Min (Board Demo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationPreset("3600")}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                      durationPreset === "3600"
                        ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    1 Hour Test
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationPreset("2592000")}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                      durationPreset === "2592000"
                        ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    30 Days
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Illustrative Withholding Tax ({taxPercent}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>Employee Share: {100 - Number(taxPercent)}% (${(Number(grossAmount) * (100 - Number(taxPercent)) / 100).toFixed(2)})</span>
                  <span>Demo Treasury: {taxPercent}% (${(Number(grossAmount) * Number(taxPercent) / 100).toFixed(2)})</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Treasury Wallet Address</label>
                <input
                  type="text"
                  value={treasuryAddress}
                  onChange={(e) => setTreasuryAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-[11px]"
                />
              </div>

              {/* Two-step Transaction Execution */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-400">Current Token Allowance:</span>
                  <span className="font-mono text-slate-200">
                    {allowance ? `${formatUnits(allowance, 6)} mUSDC` : "0 mUSDC"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-all disabled:opacity-50"
                  >
                    {isApproving ? "Approving..." : "Step 1: Approve Allowance"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateStream}
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating..." : "Step 2: Fund Stream"}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Employee Profile */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white">Add Employee to Directory</h3>
            <p className="text-xs text-slate-400 mt-1">
              Associate employee name and organization role with an Ethereum wallet.
            </p>

            <form onSubmit={handleAddEmployee} className="mt-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder="e.g. Carol Danvers"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Role / Job Title</label>
                <input
                  type="text"
                  required
                  value={newEmpRole}
                  onChange={(e) => setNewEmpRole(e.target.value)}
                  placeholder="e.g. Protocol Auditor"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Ethereum Wallet Address</label>
                <input
                  type="text"
                  required
                  value={newEmpWallet}
                  onChange={(e) => setNewEmpWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Monthly Salary Target (mUSDC)</label>
                <input
                  type="number"
                  value={newEmpSalary}
                  onChange={(e) => setNewEmpSalary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-md"
                >
                  Save Employee Profile
                </button>
              </div>
            </form>

            <button
              onClick={() => setShowAddEmpModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
