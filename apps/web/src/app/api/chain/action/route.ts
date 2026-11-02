import { NextResponse } from "next/server";
import { parseUnits } from "viem";
import { getDemoWalletClient, publicClient } from "@/server/chain";
import { CONTRACT_ADDRESSES, LOCAL_HARDHAT_CHAIN_ID } from "@/lib/chain/config";
import { MOCK_USDC_ABI, PAYROLL_STREAM_ABI } from "@/lib/chain/abis";
import { db } from "@/server/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, caller, params } = body;

    const addresses = CONTRACT_ADDRESSES[LOCAL_HARDHAT_CHAIN_ID];
    const walletClient = getDemoWalletClient(caller);

    let txHash: `0x${string}`;

    switch (action) {
      case "APPROVE": {
        const amountParsed = parseUnits(String(params.amount), 6);
        txHash = await walletClient.writeContract({
          address: addresses.mockUSDC,
          abi: MOCK_USDC_ABI,
          functionName: "approve",
          args: [addresses.payrollStream, amountParsed],
        });
        break;
      }

      case "CREATE_STREAM": {
        const amountParsed = parseUnits(String(params.grossAmount), 6);
        const durationSec = BigInt(params.durationSeconds);
        const taxBps = BigInt(params.taxBps);
        txHash = await walletClient.writeContract({
          address: addresses.payrollStream,
          abi: PAYROLL_STREAM_ABI,
          functionName: "createStream",
          args: [
            params.employeeAddress as `0x${string}`,
            addresses.mockUSDC,
            amountParsed,
            durationSec,
            taxBps,
            params.treasuryAddress as `0x${string}`,
          ],
        });
        break;
      }

      case "WITHDRAW": {
        txHash = await walletClient.writeContract({
          address: addresses.payrollStream,
          abi: PAYROLL_STREAM_ABI,
          functionName: "withdraw",
          args: [BigInt(params.streamId)],
        });
        break;
      }

      case "PAUSE_STREAM": {
        txHash = await walletClient.writeContract({
          address: addresses.payrollStream,
          abi: PAYROLL_STREAM_ABI,
          functionName: "pauseStream",
          args: [BigInt(params.streamId)],
        });
        break;
      }

      case "RESUME_STREAM": {
        txHash = await walletClient.writeContract({
          address: addresses.payrollStream,
          abi: PAYROLL_STREAM_ABI,
          functionName: "resumeStream",
          args: [BigInt(params.streamId)],
        });
        break;
      }

      case "TERMINATE_STREAM": {
        txHash = await walletClient.writeContract({
          address: addresses.payrollStream,
          abi: PAYROLL_STREAM_ABI,
          functionName: "terminateStream",
          args: [BigInt(params.streamId)],
        });
        break;
      }

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    return NextResponse.json({ success: true, txHash });
  } catch (error: any) {
    console.error("Chain action error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.shortMessage ||
          error.message ||
          "Transaction execution failed on the node.",
      },
      { status: 500 }
    );
  }
}
