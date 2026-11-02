import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const StreamPayModule = buildModule("StreamPayModule", (m) => {
  const deployer = m.getAccount(0);

  const mockUSDC = m.contract("MockUSDC", [deployer]);
  const payrollStream = m.contract("PayrollStream", []);

  return { mockUSDC, payrollStream };
});

export default StreamPayModule;
