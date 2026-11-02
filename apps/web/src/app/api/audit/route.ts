import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET() {
  try {
    const logs = await db.auditLog.findMany({
      take: 50,
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
