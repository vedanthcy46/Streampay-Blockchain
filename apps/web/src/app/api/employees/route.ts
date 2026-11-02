import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    const employees = await db.employeeProfile.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, employees });
  } catch (error: any) {
    console.error("Failed to fetch employees:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, email, walletAddress, salaryMonthly, companyId, employerWallet } = body;

    if (!name || !walletAddress) {
      return NextResponse.json(
        { success: false, error: "Name and wallet address are required" },
        { status: 400 }
      );
    }

    // Ensure company exists or create default for demo
    let targetCompanyId = companyId;
    if (!targetCompanyId) {
      const defaultCompany = await db.company.upsert({
        where: { id: "default-corp" },
        update: {},
        create: {
          id: "default-corp",
          displayName: "Acme Web3 Labs",
          ownerWallet: employerWallet || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        },
      });
      targetCompanyId = defaultCompany.id;
    }

    const employee = await db.employeeProfile.create({
      data: {
        companyId: targetCompanyId,
        name,
        role: role || "Software Engineer",
        email: email || undefined,
        walletAddress: walletAddress.toLowerCase(),
        salaryMonthly: Number(salaryMonthly) || 3000,
      },
    });

    // Record audit log
    await db.auditLog.create({
      data: {
        companyId: targetCompanyId,
        actor: employerWallet || "EMPLOYER",
        action: "ADD_EMPLOYEE",
        target: employee.id,
        metadata: JSON.stringify({ name, walletAddress, role }),
      },
    });

    return NextResponse.json({ success: true, employee });
  } catch (error: any) {
    console.error("Failed to create employee:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create employee" },
      { status: 500 }
    );
  }
}
