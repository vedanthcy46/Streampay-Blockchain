import { NextResponse } from "next/server";
import { parseUnits } from "viem";
import { getDemoWalletClient, publicClient } from "@/server/chain";
import { CONTRACT_ADDRESSES, LOCAL_HARDHAT_CHAIN_ID } from "@/lib/chain/config";
import { MOCK_USDC_ABI } from "@/lib/chain/abis";
import { db } from "@/server/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipient, amount } = body;

    if (!recipient) {
      return NextResponse.json(
        { success: false, error: "Recipient address is required" },
        { status: 400 }
      );
    }

    const tokenAddress = CONTRACT_ADDRESSES[LOCAL_HARDHAT_CHAIN_ID].mockUSDC;
    const amountParsed = parseUnits(String(amount || "5000"), 6);

    const walletClient = getDemoWalletClient(recipient);

    const txHash = await walletClient.writeContract({
      address: tokenAddress,
      abi: MOCK_USDC_ABI,
      functionName: "faucet",
      args: [recipient as `0x${string}`, amountParsed],
    });

    // Wait for receipt
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    // Log to audit log
    await db.auditLog.create({
      data: {
        actor: recipient,
        action: "FAUCET_DRIP",
        target: recipient,
        metadata: JSON.stringify({ amount: amount || "5000", txHash }),
      },
    });

    return NextResponse.json({
      success: true,
      txHash,
      message: `Successfully minted ${amount || "5000"} mUSDC to ${recipient}`,
    });
  } catch (error: any) {
    console.error("Faucet API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.shortMessage ||
          error.message ||
          "Failed to execute faucet transaction. Ensure the local node is running (npx hardhat node) or connect a Web3 wallet like MetaMask.",
      },
      { status: 500 }
    );
  }
}
