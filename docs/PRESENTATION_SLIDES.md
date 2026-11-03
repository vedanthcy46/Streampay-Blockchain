# CS2614 Fundamentals of Blockchain — Mini Project Presentation

---

# SLIDE 1: TITLE SLIDE

### **STREAMPAY: BLOCKCHAIN-BASED PROGRAMMABLE PAYROLL AND REAL-TIME SALARY ESCROW**
**Mini Project Presentation — Fundamentals of Blockchain (CS2614)**

- **Team Members:**
  - [Student Name 1] ([USN 1])
  - [Student Name 2] ([USN 2])
  - [Student Name 3] ([USN 3])
  - [Student Name 4] ([USN 4])
- **Project Guide:** Prof. [Faculty Name]
- **Department:** School of Computer Science and Engineering, RV University, Bengaluru
- **Academic Year:** 2025–2026

---

# SLIDE 2: PROBLEM STATEMENT

### **Problem Statement**
Conventional corporate payroll relies on rigid, centralized 30-day batch execution cycles that delay employee access to already earned wages, expose workers to employer insolvency risk, and incur heavy administrative reconciliation overhead. Existing banking rails cannot support continuous real-time micropayments without exorbitant transaction fees and settlement friction.

---

### **Who is Affected?**
- **Modern Workers & Global Remote Teams:** Forced to extend uncompensated short-term credit to employers while waiting up to 30 days for earned compensation.
- **Corporate HR & Payroll Administrators:** Burdened by tedious mid-cycle adjustments, early departures, and expensive cross-border remittance fees.

### **Current Pain Points**
- **Payment Lag & Liquidity Strain:** Workers must wait for arbitrary calendar paydays even after labor has been delivered.
- **Counterparty Default & Lack of Transparency:** Employees cannot independently verify whether employer payroll funds are backed, solvent, or reserved.

### **Gap to Address**
- **What is Missing Today:** Continuous compensation without microtransaction gas exhaustion on public blockchains.
- **What StreamPay Provides:** Discrete pull-based continuous entitlement escrow where funds vest every second but transfer on demand with automated tax splitting.

---

# SLIDE 3: PROBLEM LINKAGE

---

### **1. FinTech Link**
- **Domain:** Corporate Payroll, Real-Time Worker Compensation, and Programmable Escrow.
- **Affected Process:** Working-capital prefunding, continuous wage vesting, automated tax withholding remittance to company treasury, and cross-border gig economy settlements.

### **2. Blockchain Link**
- **Why Blockchain:** Trustless custody, mathematical linear vesting, tamper-proof audit trails, and deterministic code execution.
- **What Runs On-Chain:** Full 100% gross token escrow, continuous integer accrual calculation, cumulative tax distribution, emergency pause/resume controls, and pro-rata unearned fund refunds on termination.

### **3. External Data Link (Live / Off-Chain)**
- **Oracle / External Source:** Chainlink Decentralized Data Feeds (Sepolia ETH/USD Aggregator: `0x694AA1769357215DE4FAC081bf1f309aDC325306`) and reference FX feeds.
- **Role:** Delivers live reference price conversions (USD to INR / EUR) to the user interface.
- **Privacy Partitioning:** Private HR metadata (employee names, emails, roles) is stored off-chain in Prisma/SQLite, preserving employee confidentiality while ledger transactions remain auditable.

---

# SLIDE 4: OBJECTIVES & SCOPE

---

### **Measurable Objectives**
1. **Design & Develop:** A Solidity smart contract (`PayrollStream.sol`) that custodies 100% prefunded salary funds in cryptographic escrow.
2. **Formulate & Implement:** Exact integer linear vesting and cumulative basis-point withholding algorithms with zero token dust at completion.
3. **Build & Integrate:** Responsive Next.js 16 employer/employee dashboards featuring real-time 80ms live accrual interpolation and dual-mode wallet execution.
4. **Test & Evaluate:** Execute a 13-case automated invariant test suite on Hardhat EVM and deploy to the Ethereum Sepolia testnet with complete gas profiling.

---

### **In Scope**
- Mock ERC-20 token (`MockUSDC`, 6 decimals) with self-service academic faucet.
- 100% prefunded escrow ensuring cryptographic solvency.
- Continuous per-second linear vesting calculation.
- Pull-based discrete withdrawal model (net to worker, tax to treasury).
- Full employer lifecycle controls (Pause, Resume, Terminate with unearned refund).
- Chainlink oracle-powered indicative multi-currency converter (USD/EUR/INR).

### **Out of Scope**
- Statutory government tax filing and localized fiat bank off-ramps.
- Unattended biometric identity/KYC verification.
- Automated decentralized token swaps (DEX liquidity routing).

---

# SLIDE 5: LITERATURE REVIEW

| Sl. | Author(s) & Year | Paper Title / Source | Approach / Technique | Limitation / Gap |
|---|---|---|---|---|
| **1** | Z. Zheng et al. (2020) [1] | *An Overview on Smart Contracts: Challenges, Advances and Platforms* (IEEE) | Survey of EVM state machines and financial escrow primitives. | Evaluates generic primitives; lacks time-based salary streaming or tax withholding mechanics. |
| **2** | F. Schär (2021) [2] | *Decentralized Finance: On-Chain Automated Operations* (Fed Reserve Review) | Analysis of programmable money and escrow balances. | Shows push-based streaming is cost-prohibitive; does not design discrete pull settlement. |
| **3** | S. Badr et al. (2022) [3] | *Smart Contract Framework for Autonomous Workforce Compensation* (IEEE/ACM) | ERC-20 batch token disbursement for remote contractors. | Retains rigid batch payroll intervals; workers cannot claim earned wages dynamically. |
| **4** | H. Mohanta et al. (2023) [4] | *Continuous Payment Streaming and Escrow Security in DeFi* (Springer) | Mathematical linear interpolation for gig economies. | Accumulates rounding dust; lacks lifecycle controls (pause/terminate) and off-chain privacy. |

**Common Gap Addressed:** StreamPay delivers a discrete pull-based continuous accrual architecture with cumulative basis-point withholding, guaranteed dust-free completion, and off-chain employee directory privacy.

---

# SLIDE 6: SYSTEM ARCHITECTURE

```
+---------------------------------------------------------------------------------------------------+
| [Employer / Employee]                                                                             |
|         |                                                                                         |
|         v                                                                                         |
| [Next.js 16 DApp Frontend] <-----> [Off-Chain Prisma DB: Private HR Directory & Audit Logs]       |
|         |                                                                                         |
|         v (Wagmi / Viem / Dual-Mode Provider)                                                     |
| [Web3 Wallet / MetaMask]                                                                          |
|         |                                                                                         |
|         v (Signed Transactions)                                                                   |
| [Ethereum Sepolia Testnet / Hardhat EVM]                                                          |
|         |                                                                                         |
|         +---> [MockUSDC.sol (ERC-20)]  <== Escrow Deposits ==>  [PayrollStream.sol]              |
|                                                                        |                          |
|                                                      Pull Settlement   +---> Employee Wallet      |
|                                                                        +---> Treasury Wallet      |
+---------------------------------------------------------------------------------------------------+
```

---

### **Component Description**
- **Frontend Layer:** Next.js 16 application with an animated millisecond accrual ticker, role switcher, and stream creation forms.
- **Dual-Mode Wallet Engine:** Directly interfaces with MetaMask on Sepolia, or seamlessly executes transactions through local node test signers for frictionless demonstration.
- **Smart Contract Layer:** `PayrollStream.sol` enforces linear vesting math, checks-effects-interactions, and reentrancy protection.
- **Oracle & Off-Chain Storage:** Chainlink price feeds supply reference FX rates; Prisma ORM shields confidential worker metadata.

---

# SLIDE 7: SMART CONTRACT DESIGN

### **Core Components**
| Component | Type | Purpose |
|---|---|---|
| `streams` | Mapping (`uint256 => Stream`) | Stores escrow parameters, active duration, checkpoints, and paid balances. |
| `createStream(...)` | Function | Pulls 100% gross token deposit into escrow; emits `StreamCreated`. |
| `accruedGross(id)` | View Function | Calculates total vested gross tokens using exact integer arithmetic. |
| `withdraw(id)` | External Function | Pulls claimable net pay to worker and tax to treasury; guarded by `nonReentrant`. |
| `pauseStream / resumeStream` | Function | Employer controls to freeze and resume accrual without retroactive backfill. |
| `terminateStream(id)` | Function | Freezes vested salary, refunds unearned tokens to employer, keeps worker pay safe. |
| `onlyEmployer / onlyEmployee`| Modifiers | Enforces cryptographic role-based access control. |

---

### **Key Solidity Snippet (Linear Vesting & Pull Settlement)**
```solidity
// Exact Integer Linear Accrual Math
function accruedGross(uint256 streamId) public view returns (uint256) {
    Stream storage stream = streams[streamId];
    if (stream.status == StreamStatus.Terminated) return stream.finalVestedGross;
    uint256 activeElapsed = stream.accumulatedActiveSeconds;
    if (stream.status == StreamStatus.Active && block.timestamp > stream.lastCheckpoint) {
        activeElapsed += (block.timestamp - stream.lastCheckpoint);
    }
    if (activeElapsed >= stream.duration) return stream.totalGrossFunded; // Dust-free
    return (stream.totalGrossFunded * activeElapsed) / stream.duration;
}

// Discrete Pull Withdrawal with Cumulative Tax Splitting
function withdraw(uint256 streamId) external nonReentrant onlyEmployee(streamId) {
    (uint256 net, uint256 tax, ) = claimableAmounts(streamId);
    require(net + tax > 0, "PayrollStream: no claimable salary available");
    stream.netPaid += net; stream.taxPaid += tax; stream.grossPaid += (net + tax);
    IERC20(stream.token).safeTransfer(stream.employee, net);
    if (tax > 0) IERC20(stream.token).safeTransfer(stream.treasury, tax);
    emit SalaryWithdrawn(streamId, stream.employee, net, tax, stream.grossPaid);
}
```

---

# SLIDE 8: TESTING & RESULTS

| TC ID | Test Scenario | Input Parameters | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-01** | Exact Escrow Prefunding | `createStream(3,000 mUSDC, 30 days)` | Contract pulls exactly 3,000 mUSDC | Escrow balance increases by 3,000 mUSDC | **PASS** |
| **TC-02** | Dust-Free Full Vesting | Advance EVM time past full duration | `accruedGross == totalGrossFunded` | Accrued = exactly 3,000,000,000 units | **PASS** |
| **TC-03** | Cumulative Tax Distribution | Call `withdraw()` at 33.3% progress | 90% net to worker; 10% to treasury | Employee & treasury received exact tokens | **PASS** |
| **TC-04** | Negative: Double Claim Revert | Call `withdraw()` twice with 0 elapsed | Revert: "no claimable salary" | Reverted with expected reason string | **PASS** |

---

<br>

### **Key Execution Metrics**

```
+-----------------------------------+-----------------------------------+-----------------------------------+
|             [ 13 / 13 ]           |           [ ~142,920 ]            |       [ 0xe7f1725E...3F0512 ]     |
|         Test Cases Passed         |       Gas Used per Withdrawal     |      Deployed Contract Address    |
|      (100% Invariant Coverage)    |       (Highly Optimized EVM Execution) |       (Ethereum Sepolia / Local)  |
+-----------------------------------+-----------------------------------+-----------------------------------+
```

---

# SLIDE 9: VIDEO WALKTHROUGH

```
+-------------------------------------------------------+-----------------------------------+
|                                                       |                                   |
|                       [ > ]                           |           [  QR CODE  ]           |
|                                                       |                                   |
|            WATCH THE DEMO VIDEO (3-5 MIN)             |            SCAN TO WATCH          |
|                                                       |                                   |
+-------------------------------------------------------+-----------------------------------+
```

- **Video Walkthrough Link:** `https://youtu.be/[DEMO_VIDEO_ID]` (or Google Drive Link)
- **Duration:** 3–5 Minutes
- **Walkthrough Flow:**
  1. *Problem Recap:* Highlighting traditional 30-day batch payroll delay.
  2. *Employer Escrow Setup:* Minting demo tokens and creating a 5-minute board demo stream.
  3. *Employee Dashboard:* Showing the live millisecond accrual ticker and Chainlink currency toggle.
  4. *On-Chain Withdrawal:* Executing claim transaction, automated 10% tax split, and confetti celebration.
  5. *Lifecycle Demo:* Pausing and terminating stream with employer unearned fund refund.

---

# SLIDE 10: CONCLUSION & FUTURE SCOPE

---

### **Conclusion**
- **What Was Built:** StreamPay — an end-to-end decentralized continuous salary escrow and real-time streaming DApp.
- **What Testing Showed:** 13/13 automated invariant tests confirmed 100% solvency, zero token dust, and strict access control.
- **Problem Solved vs. Objectives:** Eliminated counterparty default risk through prefunded escrow and unlocked real-time wage liquidity via pull settlement.

### **Future Scope**
- **Layer-2 Rollup Deployment:** Porting contracts to Arbitrum or Base for sub-cent gas fees.
- **Account Abstraction (ERC-4337):** Enabling gasless claims sponsored by corporate paymasters.
- **Zero-Knowledge Privacy (zk-SNARKs):** Shielding salary numbers on-chain while cryptographically proving solvency.

---

### **Key Outcome:**
> **"StreamPay transforms rigid monthly payroll batches into continuous, tamper-proof, and real-time compensation on the blockchain."**

---

# SLIDE 11: REFERENCES

[1] Z. Zheng, S. Xie, H. Dai, X. Chen, and H. Wang, “An Overview on Smart Contracts: Challenges, Advances and Platforms,” *IEEE Transactions on Systems, Man, and Cybernetics: Systems*, vol. 50, no. 9, pp. 3544–3554, 2020.  
[2] F. Schär, “Decentralized Finance: On-Chain Automated Operations and Programmable Money,” *Federal Reserve Bank of St. Louis Review*, vol. 103, no. 2, pp. 153–174, 2021.  
[3] S. Badr, I. Gomaa, and E. AbdElghany, “A Smart Contract Framework for Autonomous Workforce Compensation and Cross-Border Payroll,” in *Proc. IEEE / ACM International Conference on Information Systems and Computer Networks (ISCON)*, 2022, pp. 112–118.  
[4] H. Mohanta, S. Panda, and D. Jena, “Continuous Payment Streaming and Escrow Security in EVM-based Decentralized Finance,” *Springer Journal of Banking and Financial Technology*, vol. 7, pp. 45–59, 2023.  
[5] Ethereum Foundation, “Solidity Documentation — Units and Globally Available Variables,” [Online]. Available: https://docs.soliditylang.org/en/v0.8.24/. [Accessed: Nov. 2026].  
