import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo company and employee profiles...");

  const company = await prisma.company.upsert({
    where: { id: "default-corp" },
    update: {},
    create: {
      id: "default-corp",
      displayName: "StreamPay Autonomous Labs",
      ownerWallet: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    },
  });

  // Seed sample employees with standard Hardhat test accounts
  // Account 1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (Alice Worker)
  // Account 2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (Bob Developer)
  const employee1 = await prisma.employeeProfile.upsert({
    where: { id: "emp-1" },
    update: {},
    create: {
      id: "emp-1",
      companyId: company.id,
      name: "Alice Johnson",
      role: "Lead Smart Contract Engineer",
      email: "alice@streampay.demo",
      walletAddress: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      salaryMonthly: 3000,
    },
  });

  const employee2 = await prisma.employeeProfile.upsert({
    where: { id: "emp-2" },
    update: {},
    create: {
      id: "emp-2",
      companyId: company.id,
      name: "Bob Vance",
      role: "Full-Stack Web3 Architect",
      email: "bob@streampay.demo",
      walletAddress: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
      salaryMonthly: 4500,
    },
  });

  console.log("Seeding complete:", { company: company.displayName, employees: [employee1.name, employee2.name] });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
