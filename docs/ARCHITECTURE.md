# StreamPay Architecture & Technical Specification

## 1. Overview
StreamPay is a decentralized application designed for programmable, real-time salary streaming using smart contract escrow on EVM-compatible blockchains. 

### Core Architectural Decisions
1. **Continuous Entitlement with Discrete Settlement (Pull Model):**
   - Salary vests continuously every second based on active duration and integer block timestamps.
   - Tokens transfer **only** when an explicit withdrawal transaction is submitted by the employee.
   - This eliminates continuous microtransaction gas costs while guaranteeing cryptographic solvency.

2. **100% Escrow Prefunding:**
   - The employer prefunds the entire gross salary obligation into the `PayrollStream` contract at agreement inception.
   - Vested salary belongs immutably to the employee and can never be clawed back or revoked by the employer.

3. **Simulated Tax Withholding:**
   - Every claim calculates cumulative tax withholding in basis points ($1000 \text{ bps} = 10.00\%$).
   - On withdrawal, the net portion routes to the employee's wallet, while the withheld portion routes atomically to the company demo treasury wallet.

4. **Clean On-Chain / Off-Chain Boundary:**
   - **On-chain:** Escrow custody, exact integer vesting arithmetic, lifecycle state machine (Active, Paused, Terminated, Completed), and event audit logs.
   - **Off-chain:** Private HR metadata (names, roles, emails), tenant management, event indexing projection, and Chainlink FX reference conversions.

---

## 2. Smart Contract Data Model & State Machine

```
              [ Pending ]
                   |
             (createStream)
                   |
                   v
  +-----------> [ Active ] <----------+
  |                |                  |
  |          (pauseStream)      (resumeStream)
  |                |                  |
  |                v                  |
  |            [ Paused ] ------------+
  |                |
(all claimed)  (terminateStream)
  |                |
  v                v
[ Completed ]  [ Terminated ]
```

### Invariants Enforced
- **Strict Escrow Solvency:** $\text{Paid} + \text{Remaining Vested} + \text{Refunded Unvested} = \text{Total Funded Gross}$.
- **Immutable Vested Rights:** Once earned, wages remain withdrawable by the employee even if the stream is paused or terminated.
- **Accurate Pause Tracking:** `accumulatedActiveSeconds` pauses exactly when `pauseStream` is called and resumes without retroactive backfill.

---

## 3. Technology Stack

- **Smart Contracts:** Solidity `0.8.24`, OpenZeppelin Contracts `5.6.1` (`SafeERC20`, `ReentrancyGuard`, `ERC20`, `Ownable`).
- **Framework:** Hardhat 3 (TypeScript), Mocha, Chai, Ethers.js v6.
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Web3 Integration:** `wagmi` 2.x, `viem` 2.x, `@tanstack/react-query`.
- **Database & Backend:** SQLite / PostgreSQL, Prisma ORM 5.22, Next.js API Routes.
- **Oracles:** Chainlink Price Feeds (ETH/USD, reference USD/INR conversion).
