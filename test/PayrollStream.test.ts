import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("StreamPay Payroll System Tests", function () {
  async function deployFixture() {
    const [deployer, employer, employee, treasury, unauthorized] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDCFactory.deploy(deployer.address);
    await mockUSDC.waitForDeployment();

    // Deploy PayrollStream
    const PayrollStreamFactory = await ethers.getContractFactory("PayrollStream");
    const payrollStream = await PayrollStreamFactory.deploy();
    await payrollStream.waitForDeployment();

    // Setup initial tokens for employer: 10,000 mUSDC (6 decimals)
    const initialEmployerBalance = 10_000n * 10n ** 6n;
    await mockUSDC.connect(deployer).mint(employer.address, initialEmployerBalance);

    return {
      mockUSDC,
      payrollStream,
      deployer,
      employer,
      employee,
      treasury,
      unauthorized,
      initialEmployerBalance,
    };
  }

  // Helper to advance EVM block timestamp
  async function increaseTime(seconds: number) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine", []);
  }

  describe("1. Token Mint, Faucet & Escrow Funding", function () {
    it("Should mint tokens and verify 6 decimals", async function () {
      const { mockUSDC, deployer, employer } = await deployFixture();
      expect(await mockUSDC.decimals()).to.equal(6);

      const balance = await mockUSDC.balanceOf(employer.address);
      expect(balance).to.equal(10_000n * 10n ** 6n);
    });

    it("Should allow public faucet up to 50,000 mUSDC", async function () {
      const { mockUSDC, unauthorized } = await deployFixture();
      const dripAmount = 5_000n * 10n ** 6n;
      await expect(mockUSDC.connect(unauthorized).faucet(unauthorized.address, dripAmount))
        .to.emit(mockUSDC, "FaucetDripped")
        .withArgs(unauthorized.address, dripAmount);

      expect(await mockUSDC.balanceOf(unauthorized.address)).to.equal(dripAmount);
    });

    it("Should pull exact gross funding into PayrollStream escrow upon creation", async function () {
      const { mockUSDC, payrollStream, employer, employee, treasury } = await deployFixture();
      const grossAmount = 3_000n * 10n ** 6n; // 3,000 mUSDC
      const duration = 30 * 24 * 3600; // 30 days in seconds
      const taxBps = 1000n; // 10%

      // Approve escrow
      await mockUSDC.connect(employer).approve(await payrollStream.getAddress(), grossAmount);

      const employerBalBefore = await mockUSDC.balanceOf(employer.address);
      const contractBalBefore = await mockUSDC.balanceOf(await payrollStream.getAddress());

      const tx = await payrollStream.connect(employer).createStream(
        employee.address,
        await mockUSDC.getAddress(),
        grossAmount,
        duration,
        taxBps,
        treasury.address
      );

      await expect(tx)
        .to.emit(payrollStream, "StreamCreated")
        .withArgs(
          1n,
          employer.address,
          employee.address,
          await mockUSDC.getAddress(),
          grossAmount,
          duration,
          taxBps,
          treasury.address
        );

      const employerBalAfter = await mockUSDC.balanceOf(employer.address);
      const contractBalAfter = await mockUSDC.balanceOf(await payrollStream.getAddress());

      expect(employerBalBefore - employerBalAfter).to.equal(grossAmount);
      expect(contractBalAfter - contractBalBefore).to.equal(grossAmount);
    });
  });

  describe("2. Accrual Invariants & Exact Math", function () {
    it("Accrued gross is zero immediately and equals total gross at full duration without dust", async function () {
      const { mockUSDC, payrollStream, employer, employee, treasury } = await deployFixture();
      const grossAmount = 3_000n * 10n ** 6n;
      const duration = 1000; // 1000 seconds
      const taxBps = 1000n; // 10%

      await mockUSDC.connect(employer).approve(await payrollStream.getAddress(), grossAmount);
      await payrollStream.connect(employer).createStream(
        employee.address,
        await mockUSDC.getAddress(),
        grossAmount,
        duration,
        taxBps,
        treasury.address
      );

      // Check immediately (active elapsed = 0)
      const accrued0 = await payrollStream.accruedGross(1n);
      expect(accrued0).to.equal(0n);

      // Advance by half duration (500 seconds)
      await increaseTime(500);
      const accruedHalf = await payrollStream.accruedGross(1n);
      // Allow minor 1-second drift if block timestamp advanced slightly
      expect(accruedHalf).to.be.closeTo(1_500n * 10n ** 6n, 3_000n * 10n ** 6n / 1000n);

      // Advance past full duration
      await increaseTime(600);
      const accruedFull = await payrollStream.accruedGross(1n);
      // Invariant: At or beyond full duration, accrued gross MUST equal totalGrossFunded exactly
      expect(accruedFull).to.equal(grossAmount);
    });
  });

  describe("3. Withdrawals, Double Claim Prevention & Solvency", function () {
    it("Transfers cumulative net to employee and tax to treasury, preventing duplicate claims", async function () {
      const { mockUSDC, payrollStream, employer, employee, treasury } = await deployFixture();
      const grossAmount = 3_000n * 10n ** 6n;
      const duration = 3000; // 3000 seconds
      const taxBps = 1000n; // 10%

      await mockUSDC.connect(employer).approve(await payrollStream.getAddress(), grossAmount);
      await payrollStream.connect(employer).createStream(
        employee.address,
        await mockUSDC.getAddress(),
        grossAmount,
        duration,
        taxBps,
        treasury.address
      );

      // Advance 1000 seconds -> 1/3 of the stream (1,000 mUSDC gross)
      await increaseTime(1000);

      const employeeBalBefore = await mockUSDC.balanceOf(employee.address);
      const treasuryBalBefore = await mockUSDC.balanceOf(treasury.address);

      // First withdrawal
      const tx1 = await payrollStream.connect(employee).withdraw(1n);
      const receipt1 = await tx1.wait();

      const employeeBalAfter1 = await mockUSDC.balanceOf(employee.address);
      const treasuryBalAfter1 = await mockUSDC.balanceOf(treasury.address);

      const netReceived1 = employeeBalAfter1 - employeeBalBefore;
      const taxReceived1 = treasuryBalAfter1 - treasuryBalBefore;

      // 10% of gross should be tax, 90% should be employee net
      expect(taxReceived1 * 9n).to.be.closeTo(netReceived1, 10n);

      // Pause the stream so no additional seconds accrue
      await payrollStream.connect(employer).pauseStream(1n);

      // Claim remaining accrual accumulated up to the pause block
      await payrollStream.connect(employee).withdraw(1n);

      // Calling withdraw again while paused with 0 unwithdrawn accrual MUST revert
      await expect(payrollStream.connect(employee).withdraw(1n)).to.be.revertedWith(
        "PayrollStream: no claimable salary available"
      );
    });

    it("Partial claim followed by final claim transfers only incremental entitlement", async function () {
      const { mockUSDC, payrollStream, employer, employee, treasury } = await deployFixture();
      const grossAmount = 1_000n * 10n ** 6n;
      const duration = 100; // 100 seconds
      const taxBps = 2000n; // 20%

      await mockUSDC.connect(employer).approve(await payrollStream.getAddress(), grossAmount);
      await payrollStream.connect(employer).createStream(
        employee.address,
        await mockUSDC.getAddress(),
        grossAmount,
        duration,
        taxBps,
        treasury.address
      );

      // Advance 40 seconds
      await increaseTime(40);
      await payrollStream.connect(employee).withdraw(1n);

      // Advance past remaining 60 seconds
      await increaseTime(80);
      await payrollStream.connect(employee).withdraw(1n);

      const stream = await payrollStream.getStream(1n);
      expect(stream.grossPaid).to.equal(grossAmount);
      expect(stream.status).to.equal(4); // Completed

      const totalEmployeeNet = await mockUSDC.balanceOf(employee.address);
      const totalTreasuryTax = await mockUSDC.balanceOf(treasury.address);

      expect(totalEmployeeNet + totalTreasuryTax).to.equal(grossAmount);
      expect(totalTreasuryTax).to.equal(200n * 10n ** 6n); // 20% of 1000 = 200
      expect(totalEmployeeNet).to.equal(800n * 10n ** 6n); // 80% of 1000 = 800
    });
  });

  describe("4. Lifecycle: Pause, Resume and Termination", function () {
    it("Pause fixes accrual; resume restarts without retroactive pay", async function () {
      const { mockUSDC, payrollStream, employer, employee, treasury } = await deployFixture();
      const grossAmount = 1_000n * 10n ** 6n;
      const duration = 1000;

      await mockUSDC.connect(employer).approve(await payrollStream.getAddress(), grossAmount);
      await payrollStream.connect(employer).createStream(
        employee.address,
        await mockUSDC.getAddress(),
        grossAmount,
        duration,
        0n,
        ethers.ZeroAddress
      );

      // Run 200 seconds
      await increaseTime(200);
      await payrollStream.connect(employer).pauseStream(1n);

      const accruedAtPause = await payrollStream.accruedGross(1n);

      // Advance 500 seconds during pause
      await increaseTime(500);
      const accruedDuringPause = await payrollStream.accruedGross(1n);
      // Accrued amount MUST NOT change while paused
      expect(accruedDuringPause).to.equal(accruedAtPause);

      // Resume stream
      await payrollStream.connect(employer).resumeStream(1n);

      // Advance 100 active seconds
      await increaseTime(100);
      const accruedAfterResume = await payrollStream.accruedGross(1n);
      // Accrual should increase by ~100 seconds worth, not the 500 pause seconds
      const expectedIncrease = (grossAmount * 100n) / BigInt(duration);
      expect(accruedAfterResume - accruedAtPause).to.be.closeTo(expectedIncrease, 2n * 10n ** 6n);
    });

    it("Termination freezes vested earnings for employee and refunds unearned funds to employer", async function () {
      const { mockUSDC, payrollStream, employer, employee, treasury } = await deployFixture();
      const grossAmount = 2_000n * 10n ** 6n;
      const duration = 2000; // 2000 seconds

      await mockUSDC.connect(employer).approve(await payrollStream.getAddress(), grossAmount);
      await payrollStream.connect(employer).createStream(
        employee.address,
        await mockUSDC.getAddress(),
        grossAmount,
        duration,
        1000n,
        treasury.address
      );

      // Let 500 seconds elapse (25% vested: 500 mUSDC)
      await increaseTime(500);

      const employerBalBeforeTerm = await mockUSDC.balanceOf(employer.address);

      // Employer terminates
      const tx = await payrollStream.connect(employer).terminateStream(1n);
      await expect(tx).to.emit(payrollStream, "StreamTerminated");
      await expect(tx).to.emit(payrollStream, "UnearnedFundsRefunded");

      const employerBalAfterTerm = await mockUSDC.balanceOf(employer.address);
      const refund = employerBalAfterTerm - employerBalBeforeTerm;

      // Unearned refund should be ~75% (1500 mUSDC)
      expect(refund).to.be.closeTo(1_500n * 10n ** 6n, 3_000_000n);

      const stream = await payrollStream.getStream(1n);
      expect(stream.status).to.equal(3); // Terminated
      expect(stream.finalVestedGross + stream.refundedAmount).to.equal(grossAmount);

      // Employee can still claim vested amount after termination!
      const [claimableNet, claimableTax] = await payrollStream.claimableAmounts(1n);
      expect(claimableNet + claimableTax).to.equal(stream.finalVestedGross);

      await payrollStream.connect(employee).withdraw(1n);
      const employeeBal = await mockUSDC.balanceOf(employee.address);
      expect(employeeBal).to.equal(claimableNet);
    });
  });

  describe("5. Permissions, Authorization & Reverts", function () {
    it("Reverts when non-employer tries to pause, resume or terminate", async function () {
      const { mockUSDC, payrollStream, employer, employee, unauthorized } = await deployFixture();
      const grossAmount = 1_000n * 10n ** 6n;
      const duration = 500;

      await mockUSDC.connect(employer).approve(await payrollStream.getAddress(), grossAmount);
      await payrollStream.connect(employer).createStream(
        employee.address,
        await mockUSDC.getAddress(),
        grossAmount,
        duration,
        0n,
        ethers.ZeroAddress
      );

      await expect(payrollStream.connect(unauthorized).pauseStream(1n))
        .to.be.revertedWith("PayrollStream: caller is not stream employer");

      await expect(payrollStream.connect(employee).terminateStream(1n))
        .to.be.revertedWith("PayrollStream: caller is not stream employer");
    });

    it("Reverts when unauthorized wallet attempts to withdraw employee salary", async function () {
      const { mockUSDC, payrollStream, employer, employee, unauthorized } = await deployFixture();
      const grossAmount = 1_000n * 10n ** 6n;
      const duration = 500;

      await mockUSDC.connect(employer).approve(await payrollStream.getAddress(), grossAmount);
      await payrollStream.connect(employer).createStream(
        employee.address,
        await mockUSDC.getAddress(),
        grossAmount,
        duration,
        0n,
        ethers.ZeroAddress
      );

      await increaseTime(100);

      await expect(payrollStream.connect(unauthorized).withdraw(1n))
        .to.be.revertedWith("PayrollStream: caller is not stream employee");

      await expect(payrollStream.connect(employer).withdraw(1n))
        .to.be.revertedWith("PayrollStream: caller is not stream employee");
    });

    it("Reverts with invalid creation parameters (zero address, 0 amount, 0 duration, employer == employee)", async function () {
      const { mockUSDC, payrollStream, employer } = await deployFixture();
      const tokenAddr = await mockUSDC.getAddress();

      // Zero employee address
      await expect(
        payrollStream.connect(employer).createStream(ethers.ZeroAddress, tokenAddr, 1000n, 100n, 0n, ethers.ZeroAddress)
      ).to.be.revertedWith("PayrollStream: invalid employee address");

      // Employee == Employer
      await expect(
        payrollStream.connect(employer).createStream(employer.address, tokenAddr, 1000n, 100n, 0n, ethers.ZeroAddress)
      ).to.be.revertedWith("PayrollStream: employee cannot be employer");

      // Zero gross amount
      await expect(
        payrollStream.connect(employer).createStream(ethers.Wallet.createRandom().address, tokenAddr, 0n, 100n, 0n, ethers.ZeroAddress)
      ).to.be.revertedWith("PayrollStream: gross amount must be > 0");

      // Zero duration
      await expect(
        payrollStream.connect(employer).createStream(ethers.Wallet.createRandom().address, tokenAddr, 1000n, 0n, 0n, ethers.ZeroAddress)
      ).to.be.revertedWith("PayrollStream: duration must be > 0");

      // Tax bps > 100%
      await expect(
        payrollStream.connect(employer).createStream(ethers.Wallet.createRandom().address, tokenAddr, 1000n, 100n, 10001n, ethers.ZeroAddress)
      ).to.be.revertedWith("PayrollStream: taxBps exceeds 100%");
    });

    it("Correctly indexes streams by employer and employee", async function () {
      const { mockUSDC, payrollStream, employer, employee, treasury } = await deployFixture();
      const grossAmount = 500n * 10n ** 6n;

      await mockUSDC.connect(employer).approve(await payrollStream.getAddress(), grossAmount * 2n);

      await payrollStream.connect(employer).createStream(
        employee.address,
        await mockUSDC.getAddress(),
        grossAmount,
        500,
        500n,
        treasury.address
      );

      await payrollStream.connect(employer).createStream(
        employee.address,
        await mockUSDC.getAddress(),
        grossAmount,
        1000,
        1000n,
        treasury.address
      );

      const empStreams = await payrollStream.getStreamsByEmployer(employer.address);
      const workerStreams = await payrollStream.getStreamsByEmployee(employee.address);

      expect(empStreams.length).to.equal(2);
      expect(workerStreams.length).to.equal(2);
      expect(empStreams[0]).to.equal(1n);
      expect(empStreams[1]).to.equal(2n);
    });

    it("Preserves strict solvency invariant: payouts + escrow remaining == total funded", async function () {
      const { mockUSDC, payrollStream, employer, employee, treasury } = await deployFixture();
      const grossAmount = 10_000n * 10n ** 6n;
      const duration = 1000;
      const taxBps = 1500n; // 15%

      await mockUSDC.connect(employer).approve(await payrollStream.getAddress(), grossAmount);
      await payrollStream.connect(employer).createStream(
        employee.address,
        await mockUSDC.getAddress(),
        grossAmount,
        duration,
        taxBps,
        treasury.address
      );

      // Perform multiple random withdrawals over time
      await increaseTime(250);
      await payrollStream.connect(employee).withdraw(1n);

      await increaseTime(250);
      await payrollStream.connect(employee).withdraw(1n);

      await increaseTime(600); // Past duration
      await payrollStream.connect(employee).withdraw(1n);

      const contractBalance = await mockUSDC.balanceOf(await payrollStream.getAddress());
      const employeeBalance = await mockUSDC.balanceOf(employee.address);
      const treasuryBalance = await mockUSDC.balanceOf(treasury.address);

      expect(contractBalance).to.equal(0n);
      expect(employeeBalance + treasuryBalance).to.equal(grossAmount);
      expect(treasuryBalance).to.equal((grossAmount * taxBps) / 10_000n);
    });
  });
});
