import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employerWallet = searchParams.get("employer");
    const employeeWallet = searchParams.get("employee");

    const where: any = {};
    if (employerWallet) where.employerWallet = employerWallet.toLowerCase();
    if (employeeWallet) where.employeeWallet = employeeWallet.toLowerCase();

    const streams = await db.streamProjection.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, streams });
  } catch (error: any) {
    console.error("Failed to fetch streams:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch streams" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      chainId,
      contractAddress,
      streamId,
      employerWallet,
      employeeWallet,
      status,
      totalGross,
      durationSeconds,
      taxBps,
      treasuryWallet,
      indexedBlock,
      txHash,
    } = body;

    const stream = await db.streamProjection.upsert({
      where: {
        chainId_contractAddress_streamId: {
          chainId: Number(chainId),
          contractAddress: contractAddress.toLowerCase(),
          streamId: Number(streamId),
        },
      },
      update: {
        status: status || "ACTIVE",
        indexedBlock: Number(indexedBlock) || 0,
      },
      create: {
        chainId: Number(chainId),
        contractAddress: contractAddress.toLowerCase(),
        streamId: Number(streamId),
        employerWallet: employerWallet.toLowerCase(),
        employeeWallet: employeeWallet.toLowerCase(),
        status: status || "ACTIVE",
        totalGross: String(totalGross),
        durationSeconds: Number(durationSeconds),
        taxBps: Number(taxBps),
        treasuryWallet: (treasuryWallet || "").toLowerCase(),
        indexedBlock: Number(indexedBlock) || 0,
      },
    });

    // Record audit log
    await db.auditLog.create({
      data: {
        actor: employerWallet,
        action: `STREAM_${status || "CREATED"}`,
        target: `stream-${streamId}`,
        metadata: JSON.stringify({ txHash, totalGross, durationSeconds, taxBps }),
      },
    });

    return NextResponse.json({ success: true, stream });
  } catch (error: any) {
    console.error("Failed to update stream projection:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update stream" },
      { status: 500 }
    );
  }
}
