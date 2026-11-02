import { network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const { ethers } = await network.create();
  const [deployer] = await ethers.getSigners();
  console.log(`\n========================================`);
  console.log(`StreamPay Deployment`);
  console.log(`Deployer address: ${deployer.address}`);
  console.log(`========================================\n`);

  // 1. Deploy MockUSDC
  console.log("1. Deploying MockUSDC token (6 decimals)...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy(deployer.address);
  await mockUSDC.waitForDeployment();
  const mockUSDCAddress = await mockUSDC.getAddress();
  console.log(`   MockUSDC deployed at: ${mockUSDCAddress}`);

  // 2. Deploy PayrollStream
  console.log("\n2. Deploying PayrollStream escrow contract...");
  const PayrollStream = await ethers.getContractFactory("PayrollStream");
  const payrollStream = await PayrollStream.deploy();
  await payrollStream.waitForDeployment();
  const payrollStreamAddress = await payrollStream.getAddress();
  console.log(`   PayrollStream deployed at: ${payrollStreamAddress}`);

  // 3. Export deployment artifacts
  const deploymentInfo = {
    network: network.name || "hardhat",
    deployer: deployer.address,
    contracts: {
      MockUSDC: mockUSDCAddress,
      PayrollStream: payrollStreamAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(process.cwd(), "deployed-addresses.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\nDeployment details successfully saved to deployed-addresses.json\n`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});
