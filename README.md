# StreamPay | Programmable Blockchain Payroll & Real-Time Salary Escrow

> **Academic Project Submission** | *Fundamentals of Blockchain*  
> **Target Network:** Ethereum Sepolia Testnet & Hardhat EVM  
> **Tech Stack:** Solidity 0.8.24, Hardhat 3, OpenZeppelin 5.x, Next.js 16, wagmi/viem, Prisma & SQLite/PostgreSQL, Chainlink Data Feeds.

---

## 🌟 Executive Summary

**StreamPay** is a decentralized application that enables an employer to prefund salary into a smart contract escrow while an employee earns wages continuously per second. The employee can withdraw their earned salary at any moment without waiting for a traditional monthly batch cycle.

### Key Architectural Invariants
1. **Pull-Based Settlement:** Entitlement is calculated continuously by the smart contract, but tokens are transferred **only on an explicit withdrawal transaction**. This avoids microtransaction gas costs while maintaining cryptographic solvency.
2. **100% Escrow Prefunding:** The employer deposits the full gross stream amount upfront. An employer cannot revoke or claw back wages that have already vested.
3. **Simulated Tax Withholding:** On each withdrawal, a configurable basis points percentage (e.g. 10% / 1,000 bps) is automatically split and routed to a dedicated treasury address, while the net amount transfers to the worker.
4. **Lifecycle Governance:** Employers can **Pause** (stops accrual without retroactive backfill), **Resume**, or **Terminate** (locks vested pay for the employee and refunds unearned funds to the employer).

---

## 📁 Repository Structure

```
├── contracts/                  # Solidity smart contracts
│   ├── MockUSDC.sol            # 6-decimal test stablecoin with public demo faucet
│   └── PayrollStream.sol       # Core escrow, continuous vesting & lifecycle logic
├── test/                       # Comprehensive Hardhat test suite (13 passing tests)
│   └── PayrollStream.test.ts
├── ignition/modules/           # Hardhat Ignition deployment modules
│   └── StreamPay.ts
├── scripts/                    # Deployment and ABI export automation scripts
│   ├── deploy.ts
│   └── export-abis.js
├── apps/web/                   # Next.js 16 Web3 frontend application
│   ├── src/app/                # App router pages & API endpoints
│   ├── src/components/         # Navbar, Employer & Employee dashboards, Faucet & Audit views
│   ├── src/lib/chain/          # Contract ABIs, wagmi & viem configuration
│   ├── src/server/             # Prisma client & database connector
│   └── prisma/                 # SQLite/PostgreSQL schema & demo seed script
├── packages/shared/            # Shared chain IDs, types & validation utilities
└── docs/                       # Academic documentation, presentation script & test reports
    ├── ARCHITECTURE.md
    ├── DEMO_SCRIPT.md
    └── TEST_REPORT.md
```

---

## 🚀 Quickstart Guide

### 1. Run Automated Smart Contract Tests
Run the 13 automated invariant tests in Hardhat:
```bash
npx hardhat test
```

### 2. Deploy Contracts Locally
Deploy `MockUSDC` and `PayrollStream` to the local Hardhat network:
```bash
npx hardhat run scripts/deploy.ts
```

### 3. Start the Next.js Web Application
Navigate to the web app directory and start the dev server:
```bash
cd apps/web
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🖥️ Live Board Demonstration (6 Minutes)

The web interface includes a **Fast Demo Role Switcher** in the top navigation bar, allowing immediate switching between test personas without needing multiple browser profiles:

1. **Employer (`0xf39...`):**
   - Click **Create Funded Stream**.
   - Select employee **Alice Johnson** (`0x709...`).
   - Pick the **5-Min Board Demo** preset with 3,000 mUSDC gross and 10% withholding.
   - Click **Approve Allowance**, then **Fund Stream**.
2. **Employee (`0x709...`):**
   - Switch role to **Alice Johnson** in the top-right dropdown.
   - Click the **Employee Stream Ticker** tab.
   - Observe the **real-time ticking odometer** as salary vests every millisecond!
   - View the simulated tax breakdown and the Chainlink reference fiat conversion.
   - Click **Claim Net Salary** to execute an on-chain pull transfer with a confetti celebration.
3. **Lifecycle Controls & Solvency:**
   - Switch back to Employer and test **Pause**, **Resume**, or **Terminate**.
   - Verify that unearned escrow is refunded to the employer, while Alice's earned wages remain claimable.
4. **Audit Trail:**
   - Click the **Audit Log** tab to inspect recorded transactions and the verification checklist.

---

## 📊 Evaluation Criteria & Acceptance Checklist

- [x] **Accrual:** Integer arithmetic matches formula with zero residual dust at completion.
- [x] **Solvency:** Cumulative payouts and refunds never exceed funded gross amount.
- [x] **Discrete Settlement:** Only intended employee can withdraw; duplicate claims without elapsed time revert.
- [x] **Lifecycle Safety:** Pause freezes active time; termination refunds unearned funds without touching earned pay.
- [x] **Simulated Withholding:** Treasury recipient receives the exact tax basis points upon each claim.
- [x] **Indicative Oracle Conversion:** Real-time multi-currency display (USD / EUR / INR) powered by Chainlink reference feeds.
