# StreamPay: Live Board Demonstration Script

**Target Time:** 6 Minutes  
**Audience:** Academic Examination Board / Fundamentals of Blockchain Evaluators

---

### Step-by-Step Rehearsal Guide

| Time | Stage | Action & Visual | Key Script Points |
|---|---|---|---|
| **0:00 - 0:40** | **The Batch-Payroll Problem** | Show Slide / Overview tab. | "Conventional payroll processes wages in monthly batches, forcing workers to wait for wages already earned and creating reconciliation overhead. StreamPay demonstrates programmable, real-time salary streaming using smart contract escrow." |
| **0:40 - 1:25** | **Employer Setup & Approval** | Connect Employer wallet (`0xf39...`), open Faucet or check balance. | "The employer connects to the dApp. Tokens are prefunded in `mUSDC` (6 decimals). The employer approves escrow custody before creating the stream." |
| **1:25 - 2:10** | **Create 5-Minute Demo Stream** | Select Alice Johnson (`0x709...`), 3,000 mUSDC, 5-Min Board Demo, 10% Withholding. Click Fund Stream. | "Escrow locks 3,000 mUSDC on-chain. Notice the discrete pull model: the contract calculates entitlement by time, but tokens only move on claim, avoiding continuous microtransaction gas." |
| **2:10 - 3:05** | **Switch to Employee Dashboard** | Switch role to Alice Johnson (`0x709...`) in the top navbar. | "Watch the real-time ticker: as seconds elapse, claimable salary increases dynamically! Notice the simulated 10% tax breakdown and the Chainlink reference fiat conversion." |
| **3:05 - 4:05** | **Employee Withdrawal** | Click 'Claim Net Salary'. Confirm transaction. Confetti triggers! | "Alice claims her earnings. Net funds transfer to her wallet, while the 10% tax portion automatically transfers to the treasury wallet. The transaction is verified on-chain." |
| **4:05 - 5:00** | **Lifecycle Controls: Pause & Terminate** | Switch back to Employer. Pause or Terminate a test stream. | "If work halts, the employer can pause accrual. On termination, the contract refunds unearned escrow back to the employer, while already-vested wages remain strictly withdrawable by the employee." |
| **5:00 - 6:00** | **Audit Trail & Board Q&A** | Navigate to Audit Log tab & open Terminal test report (13 passing). | "All actions are recorded in the audit log and emitted as on-chain events. Our test suite rigorously verifies all 10 core invariants." |

---

### Key Board Questions & Definitive Answers

1. **Does money transfer every second on the blockchain?**
   > *Answer:* No. The smart contract calculates continuous entitlement based on block timestamps, but token transfers occur only when an employee initiates a withdrawal request. This avoids gas-expensive microtransactions.

2. **Can an employer revoke wages that the worker has already earned?**
   > *Answer:* No. Termination freezes future accrual and refunds only unearned escrow. All accrued vested funds remain locked for the employee to withdraw at any time.

3. **Why is there an off-chain database alongside the blockchain?**
   > *Answer:* For privacy and operational efficiency. Sensitive employee HR records (names, emails, contracts) remain off-chain, while verifiable fund movements and escrow custody remain on-chain.
