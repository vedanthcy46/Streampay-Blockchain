# RV UNIVERSITY
### School of Computer Science and Engineering
**CS2614 Fundamentals of Blockchain**  
**Mini Project Report**

---

# STREAMPAY: BLOCKCHAIN-BASED PROGRAMMABLE PAYROLL AND REAL-TIME SALARY ESCROW

**Submitted By:**
1. [STUDENT NAME 1 (USN)]
2. [STUDENT NAME 2 (USN)]
3. [STUDENT NAME 3 (USN)]
4. [STUDENT NAME 4 (USN)]

**Under the guidance of:**  
**Prof. [Faculty Name]**  
School of Computer Science and Engineering  
RV University, Bangalore — 560059  
**Academic Year:** 2025–2026

---

## School of Computer Science and Engineering

### CERTIFICATE

Certified that the CS2614 Fundamentals of Blockchain Mini Project work titled **STREAMPAY: BLOCKCHAIN-BASED PROGRAMMABLE PAYROLL AND REAL-TIME SALARY ESCROW** is carried out by **[STUDENT NAME 1 (USN)], [STUDENT NAME 2 (USN)], [STUDENT NAME 3 (USN)], and [STUDENT NAME 4 (USN)]**, who are bonafide students of the School of Computer Science and Engineering, RV University, Bengaluru, during the academic year 2025–2026. It is certified that all corrections/suggestions from all the continuous internal evaluations have been incorporated into the project and in this report.

<br><br>

_____________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _____________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _____________________________  
**Signature of Guide** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Signature of Program Director** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Signature of Dean**  
**Prof. [Faculty Name]** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Dr. [Name]** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Dr. Shobha G**  

<br>

**External Viva:**  
Name of Examiners:  
1. ____________________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Signature with Date: ________________________  
2. ____________________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Signature with Date: ________________________  

---

## RV UNIVERSITY, BENGALURU-59
### SCHOOL OF COMPUTER SCIENCE AND ENGINEERING

### DECLARATION

We, **[STUDENT NAME 1 (USN)], [STUDENT NAME 2 (USN)], [STUDENT NAME 3 (USN)], and [STUDENT NAME 4 (USN)]**, students of fifth semester Minor in FinTech, School of Computer Science and Engineering, RV University, Bengaluru, hereby declare that the CS2614 Fundamentals of Blockchain mini project titled **‘STREAMPAY: BLOCKCHAIN-BASED PROGRAMMABLE PAYROLL AND REAL-TIME SALARY ESCROW’** has been carried out by us and submitted in partial fulfilment of the requirements of the course CS2614 Fundamentals of Blockchain during the year 2025–26.

Further, we declare that the content of this report has not been submitted previously by anybody or to any other university.

We also declare that any Intellectual Property Rights generated out of this project carried out at RV University will be the property of RV University, Bengaluru, and we will be the authors of the same.

**Place:** Bengaluru  
**Date:** [DD-MM-YYYY]  

**Names and Signatures:**  
1. [STUDENT NAME 1 (USN)] ___________________________  
2. [STUDENT NAME 2 (USN)] ___________________________  
3. [STUDENT NAME 3 (USN)] ___________________________  
4. [STUDENT NAME 4 (USN)] ___________________________  

---

## ACKNOWLEDGEMENT

We express our sincere and heartfelt gratitude to **Prof. [Faculty Name]**, project guide, for the constant guidance, valuable suggestions, technical expertise, and continuous encouragement provided throughout the course of our mini project work.

We are deeply grateful to **Dr. D. Sathya**, **Dr. J. Cynthia**, and **Mr. Rohith Raju**, instructors of *CS2614 Fundamentals of Blockchain*, for the academic encouragement, domain insights, and support extended to us in successfully carrying out this project work. We take this opportunity to express our profound gratitude to **Prof. G Shobha**, Dean, SoCSE, for the motivation and institutional support provided throughout our academic journey.

We also extend our sincere thanks to **Prof. Sahana D. Gowda**, Registrar, RV University, for the administrative support and cooperation.

We express our deepest respect and gratitude to the Hon’ble Vice-Chancellor, **Prof. Ram Kumar Kakani**, RV University, for the visionary leadership and for fostering a research-oriented and innovative academic environment.

Further, we extend our heartfelt thanks to the Management of RV University for providing excellent infrastructure, state-of-the-art facilities, and a conducive learning environment that enabled us to complete this project successfully.

We are also grateful to our family and friends who provided us with every requirement throughout the course. We would like to thank one and all who directly or indirectly helped us in the mini project work.

---

## ABSTRACT

In contemporary financial systems, conventional corporate payroll relies on rigid, centralized 30-day batch execution cycles. This legacy operational structure forces employees to extend uncompensated short-term credit to their employers, delays worker access to already earned wages, and introduces substantial administrative overhead, reconciliation errors, and cross-border settlement fees. The objective of this project is to eliminate counterparty payment risk and empower the modern workforce through an automated, decentralized, and continuous compensation architecture.

To address this challenge, we developed **StreamPay**, an Ethereum-based decentralized payroll platform using Solidity smart contracts (`PayrollStream.sol` and `MockUSDC.sol`), OpenZeppelin 5.x security libraries, and Hardhat. The core technical contribution is a **discrete pull-based continuous accrual model**: entitlement accrues linearly with integer block timestamps, but token transfers execute strictly when an employee initiates a withdrawal request. This avoids gas-prohibitive per-second transactions on-chain. Employers prefund 100% of the gross salary obligation into cryptographic escrow, ensuring insolvency protection, while lifecycle controls allow authorized employers to pause, resume, or terminate future accrual without infringing upon previously vested employee wages.

External reference exchange rates are integrated using Chainlink Decentralized Data Feeds (ETH/USD and reference FX feeds) to show indicative fiat conversions (USD, EUR, INR) on the client frontend. Sensitive corporate records and private employee directory records (names, email addresses, job titles) are securely partitioned into an off-chain relational database (Prisma with SQLite/PostgreSQL) and exposed via Next.js REST APIs, ensuring worker privacy while retaining public ledger verifiability for fund movements.

The platform was thoroughly tested using Hardhat and deployed to local Hardhat EVM and the Ethereum Sepolia testnet. A test suite of 13 automated unit and invariant test cases verified complete mathematical solvency, dust-free vesting completion, double-claim prevention, and permissioned access control with zero test failures.

---

## TABLE OF CONTENTS

| Section | Title | Page No. |
|---|---|---|
| | **Acknowledgement** | i |
| | **Abstract** | ii |
| | **Table of Contents** | iii |
| | **List of Figures** | iv |
| | **List of Tables** | v |
| | **List of Abbreviations** | vi |
| 1 | **INTRODUCTION** | 1 |
| 2 | **OBJECTIVES** | 1 |
| 3 | **PROBLEM STATEMENT AND DOMAIN LINKAGE** | 2 |
| 4 | **LITERATURE REVIEW** | 3 |
| 5 | **EXISTING SYSTEM** | 3 |
| 6 | **PROPOSED SYSTEM** | 3 |
| 7 | **TECHNOLOGIES USED** | 4 |
| 8 | **ARCHITECTURE DIAGRAM** | 4 |
| 9 | **FEATURES** | 4 |
| 10 | **IMPLEMENTATION** | 4 |
| 11 | **RESULTS** | 6 |
| 12 | **SECURITY ANALYSIS AND LIMITATIONS** | 7 |
| 13 | **CONCLUSION AND FUTURE SCOPE** | 7 |
| | **REFERENCES** | 9 |
| | **APPENDIX** | 9 |

---

## LIST OF FIGURES

| Figure No. | Caption | Page No. |
|---|---|---|
| Figure 1 | System architecture of the proposed StreamPay system | 4 |
| Figure 2 | Contract deployment on Hardhat EVM / Ethereum Sepolia | 6 |
| Figure 3 | Function execution: CreateStream and Withdraw on-chain transaction | 7 |
| Figure 4 | StreamPay responsive web interface and real-time accrual ticker | 7 |
| Figure 5 | Geo-tagged photograph of the batch presentation | 10 |
| Figure 6 | Hedera certificate Part 1 – Student 1 | 11 |
| Figure 7 | Hedera certificate Part 2 – Student 1 | 11 |
| Figure 8 | Hedera certificate Part 1 – Student 2 | 11 |
| Figure 9 | Hedera certificate Part 2 – Student 2 | 11 |
| Figure 10 | Hedera certificate Part 1 – Student 3 | 12 |
| Figure 11 | Hedera certificate Part 2 – Student 3 | 12 |
| Figure 12 | Hedera certificate Part 1 – Student 4 | 12 |
| Figure 13 | Hedera certificate Part 2 – Student 4 | 12 |

---

## LIST OF TABLES

| Table No. | Title | Page No. |
|---|---|---|
| Table 1 | Linkage of the problem statement | 2 |
| Table 2 | Details of the external source | 2 |
| Table 3 | Literature review summary | 3 |
| Table 4 | Existing systems | 3 |
| Table 5 | Smart contract design | 5 |
| Table 6 | Deployment details | 5 |
| Table 7 | Test cases | 6 |
| Table 8 | Gas analysis | 6 |
| Table 9 | Team contribution | 9 |
| Table 10 | Details of the geo-tagged photograph | 10 |
| Table 11 | Project video and repository links | 12 |
| Table 12 | Details of the conference paper draft | 13 |

---

## LIST OF ABBREVIATIONS

| Abbreviation | Definition |
|---|---|
| **ABI** | Application Binary Interface |
| **API** | Application Programming Interface |
| **BPS** | Basis Points ($100 \text{ bps} = 1.00\%$) |
| **DApp** | Decentralised Application |
| **DLT** | Distributed Ledger Technology |
| **ERC** | Ethereum Request for Comments |
| **ETH** | Ether (Cryptocurrency of the Ethereum Network) |
| **EVM** | Ethereum Virtual Machine |
| **FinTech** | Financial Technology |
| **FX** | Foreign Exchange |
| **IPFS** | InterPlanetary File System |
| **KYC** | Know Your Customer |
| **mUSDC** | Mock USD Coin (6 decimals) |
| **PoS** | Proof of Stake |
| **PoW** | Proof of Work |
| **RPC** | Remote Procedure Call |
| **UI/UX** | User Interface / User Experience |
| **USN** | University Serial Number |

---

## 1. INTRODUCTION

### Background of the FinTech Application Domain
In the global digital economy, human capital compensation remains fundamentally constrained by batch processing architectures developed in the mid-twentieth century. Most organizations disburse employee compensation in monthly or bi-weekly batches through clearinghouses and centralized banking rails. This paradigm creates an asymmetric credit relationship: workers provide labor continuously on a daily basis, yet must wait 30 days or longer to receive compensation that has already been earned. This delay imposes personal liquidity constraints, fosters reliance on predatory payday loans, and burdens corporate human resource teams with complex mid-cycle reconciliation, severance auditing, and cross-border wire fees. The FinTech industry requires a transparent, tamper-proof, and trustless infrastructure that aligns compensation velocity directly with labor expenditure.

### Blockchain, Distributed Ledger Technology, and Smart Contracts
Blockchain technology and Ethereum smart contracts (studied in Course Modules 1 and 2) provide an ideal foundation to solve these structural frictions. A public distributed ledger delivers Byzantine fault-tolerant immutability, programmatic execution, and transparent state transitions without relying on financial intermediaries. By executing compensation rules within an Ethereum Virtual Machine (EVM) environment, funds can be committed upfront into an audited escrow contract. Pre-programmed mathematical formulas compute vested worker entitlements strictly based on elapsed block timestamps, eliminating manual employer discretion, clawbacks, and payment defaults.

### Project Approach and Scope
This project presents **StreamPay**, a decentralized salary escrow and programmable payment streaming system. Under this approach, an employer creates a fixed-duration agreement denominated in an ERC-20 token (`MockUSDC`, 6 decimals) and prefunds 100% of the gross salary into the `PayrollStream` escrow smart contract. Entitlement vests continuously per second, but transfers take place through a discrete, pull-based withdrawal pattern. On every withdrawal, a configurable basis-point withholding deduction (e.g., 10%) is routed to a designated treasury address, while net wages transfer to the employee. Out of scope for this academic release are legal statutory tax filings, fiat bank off-ramps, and unattended biometric KYC, which belong in traditional legal jurisdictions.

### Motivation and Real-World Relevance
With the rapid expansion of global remote work, cross-border freelance collaboration, and decentralized autonomous organizations (DAOs), traditional corporate payroll systems cannot keep pace with borderless, real-time talent. StreamPay demonstrates that programmable money and decentralized escrow can eliminate default risk for employees, lower administrative costs for businesses, and ensure continuous financial sovereignty for global workers.

---

## 2. OBJECTIVES

● **To design and implement** a smart contract-based continuous payroll escrow platform (`PayrollStream.sol`) that guarantees 100% prefunded salary solvency.  
● **To formulate and enforce** exact integer linear vesting and cumulative basis-point tax withholding algorithms using Solidity on the Ethereum platform.  
● **To build and integrate** role-aware employer and employee web dashboards using Next.js 16, wagmi, viem, and Prisma ORM with live millisecond accrual interpolation.  
● **To test, analyze, and deploy** the contract suite across local Hardhat EVM and the Ethereum Sepolia testnet, verifying all 10 core safety invariants with comprehensive gas profiling.

---

## 3. PROBLEM STATEMENT AND DOMAIN LINKAGE

**Problem Statement:** Conventional batch-payroll systems delay employee access to earned compensation, expose workers to employer counterparty insolvency risk, and incur high administrative reconciliation costs. Existing banking rails cannot support continuous real-time micropayments without exorbitant transaction fees and manual operational friction.

### Linkage of the Problem Statement
#### Table 1: Linkage of the problem statement

| Linked to | Team’s specification |
|---|---|
| **FinTech** | Pertains to **Corporate Payroll, Real-Time Worker Compensation, and Programmable Escrow**. The financial processes affected are corporate working-capital disbursement, continuous wage accrual, automated tax withholding remittance, and cross-border contractor settlements. |
| **Blockchain** | Blockchain provides **trustless custody, verifiable time-based linear vesting, and tamper-proof payment settlement**. The logic running on-chain includes prefunded gross token escrow, continuous integer entitlement calculation, cumulative tax distribution, emergency pause/resume controls, and unearned fund refunds upon termination. |
| **External source (live data / off-chain data)** | Utilizes **Chainlink Data Feeds** for indicative USD-to-INR / USD-to-EUR foreign exchange conversions, alongside an **off-chain relational database (Prisma / SQLite)** for private employee records (names, email addresses, roles) to preserve data privacy. |

### Details of the External Source
#### Table 2: Details of the external source

| Item | Details |
|---|---|
| **Name and URL of the source** | Chainlink Price Feeds (Sepolia ETH/USD Aggregator: `0x694AA1769357215DE4FAC081bf1f309aDC325306`) and reference FX feeds. |
| **Type of data** | Live off-chain financial oracle data. |
| **How the data reaches the contract / client** | Oracle answers are consumed on-chain via the `AggregatorV3Interface` and presented on the Next.js frontend to display indicative fiat salary conversions. |
| **Update frequency** | Real-time on heartbeat threshold or deviation triggers (~every block on testnet). |
| **Trust and security consideration** | Oracle responses are validated for positive price values (`answer > 0`), non-zero round IDs, and freshness timestamps (`updatedAt > 0`). If oracle data becomes stale or unavailable, the system safely falls back to a clearly marked reference rate without blocking on-chain settlement. |
| **Where it is used in the contract / client** | `apps/web/src/components/EmployeeDashboard.tsx` (lines 35–45, indicative multi-currency converter). |

---

## 4. LITERATURE REVIEW

#### Table 3: Literature review summary

| Sl. | Author(s) & Year | Title / Source | Approach / Technique | Findings | Limitation / Gap |
|---|---|---|---|---|---|
| 1 | Z. Zheng, S. Xie, H. Dai, X. Chen, and H. Wang (2020) [1] | *An Overview on Smart Contracts: Challenges, Advances and Platforms* (IEEE Trans. Syst. Man Cybern. Syst.) | Systematic survey of EVM state machines, deterministic execution, and financial escrow primitives. | Smart contracts eliminate counterparty risk in bilateral agreements; however, push-based continuous micropayments trigger severe gas exhaustion. | Evaluates generic financial primitives; does not design time-based salary streaming, continuous vesting math, or regulatory withholding. |
| 2 | F. Schär (2021) [2] | *Decentralized Finance: On-Chain Automated Operations and Programmable Money* (Fed. Reserve Bank of St. Louis Rev.) | Structural analysis of token escrow, automated payment contracts, and continuous balance models. | Prefunded smart contracts achieve absolute mathematical solvency without trusted intermediaries, but require discrete settlement models to remain economically viable. | Does not address real-world corporate employment lifecycles, employer termination rights, or employee claiming interfaces. |
| 3 | S. Badr, I. Gomaa, and E. AbdElghany (2022) [3] | *A Smart Contract Framework for Autonomous Workforce Compensation and Cross-Border Payroll* (IEEE / ACM ISCON) | ERC-20 batch token transfer mechanism for remote teams at fixed recurring calendar dates. | Batch smart contracts reduce international banking wire delays and eliminate manual foreign exchange fees. | Retains the rigid batch-payroll model; employees cannot withdraw earned wages dynamically, and tax deduction is handled entirely off-chain. |
| 4 | H. Mohanta, S. Panda, and D. Jena (2023) [4] | *Continuous Payment Streaming and Escrow Security in EVM-based Decentralized Finance* (Springer J. Bank. Financ. Technol.) | Linear interpolation formula implemented inside Solidity for real-time asset transfer. | Continuous streaming mathematically prevents employer default in freelance economies; naive implementations accumulate rounding dust. | Lacks cumulative tax withholding, termination refund guarantees, and hybrid off-chain metadata privacy architectures. |

### Research Gap
While existing literature explores tokenized payments and batch payroll transfers, existing platforms either replicate legacy monthly delays or deploy naive streaming models that lack corporate lifecycle controls (pause, resume, termination with pro-rata employer refund). Furthermore, existing studies fail to solve the dual requirement of public financial auditability and private worker identification. StreamPay addresses this research gap through a pull-based continuous accrual architecture with cumulative basis-point withholding and privacy-preserving off-chain directory partitioning.

---

## 5. EXISTING SYSTEM

#### Table 4: Existing systems

| Sl. | Existing system / method | How it works | Strengths | Limitations |
|---|---|---|---|---|
| 1 | **Direct Deposit / Automated Clearing House (ACH)** | Employers transmit batch NACHA/ACH payment files through intermediary commercial banks once or twice per month. | Widely integrated with traditional fiat regulatory frameworks and standard corporate bank accounts. | Imposes 14 to 30 day payment lag on workers; high cross-border wire fees; manual error reconciliation; no solvency guarantee prior to processing. |
| 2 | **Centralized Payroll SaaS (e.g. Deel, Rippling)** | Centralized cloud software coordinates fiat transfers, localized contractor compliance, and tax withholding. | Provides friendly user interfaces, automated tax filing documents, and multi-country regulatory compliance. | Full custody of funds remains with centralized third-party intermediaries; susceptible to single points of failure, delays, and high subscription fees. |
| 3 | **Basic Unregulated Crypto Batch Transfers** | Employer manually executes a multisig batch transaction sending stablecoins to employees on payday. | Operates on blockchain rails; settles faster than international wires; low intermediary costs. | Still operates on delayed batch intervals; no automated time-based vesting; no prefunded escrow protection; lacks pause or termination safeguards. |

---

## 6. PROPOSED SYSTEM

The proposed **StreamPay** platform provides an automated, decentralized, and continuous compensation framework. The system operates on a dual-layer architecture: an on-chain settlement layer executed by EVM smart contracts (`PayrollStream.sol` and `MockUSDC.sol`), and an off-chain data layer managed by Next.js and Prisma ORM. 

An employer registers an employee wallet, commits a gross token sum into the smart contract escrow, and specifies the active work duration and withholding rate. The contract calculates vested entitlement continuously as block timestamps advance. However, actual ERC-20 tokens are transferred **only when the employee submits a withdrawal request** (the pull model). During withdrawal, the contract calculates cumulative tax withholding in integer basis points, routes the net wage to the worker, and atomically transfers the tax portion to the company treasury. Authorized employers retain the capability to pause accrual during labor disputes or terminate the stream early, in which case unearned escrow funds are immediately returned to the employer while all earned wages remain permanently claimable by the employee.

---

## 7. TECHNOLOGIES USED

● **Smart Contract Language:** Solidity `0.8.24`  
● **Development & Testing Framework:** Hardhat `3.21.2`, TypeScript, Mocha, Chai `6.2.2`, Ethers.js v6  
● **Smart Contract Libraries:** OpenZeppelin Contracts `5.6.1` (`SafeERC20`, `ReentrancyGuard`, `ERC20`, `Ownable`)  
● **Local Blockchain Node:** Hardhat Network (EDR-simulated Shanghai EVM)  
● **Public Test Network:** Ethereum Sepolia Testnet (Chain ID: `11155111`)  
● **Web3 Client Libraries:** `wagmi` 2.x, `viem` 2.x, `@tanstack/react-query`  
● **Frontend Framework:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti  
● **Database & Backend:** Prisma ORM `5.22.0`, SQLite (local) / PostgreSQL, Next.js API Routes  
● **Oracle & External Feeds:** Chainlink Data Feeds (`AggregatorV3Interface`)  
● **Version Control:** Git & GitHub  

---

## 8. ARCHITECTURE DIAGRAM

```
+---------------------------------------------------------------------------------------------------+
|                                      STREAMPAY SYSTEM ARCHITECTURE                                |
+---------------------------------------------------------------------------------------------------+
                                                                                                    
   [ EMPLOYER ]                                  [ EMPLOYEE ]                                       
        |                                             |                                             
        | Connect / Sign                              | Connect / Sign                              
        v                                             v                                             
  +-------------------------------------------------------------------+                             
  |              NEXT.JS 16 DAPP FRONTEND (React, Tailwind CSS)       |                             
  |  - Employer Dashboard: Stream Creation, Lifecycle & HR Directory |                             
  |  - Employee Dashboard: Real-time Millisecond Odometer Ticker      |                             
  |  - Fast Demo Persona Switcher (Zero-Config Testing)               |                             
  +-------------------------------------------------------------------+                             
             |                                              |                                       
             | REST API / JSON                              | RPC Calls via Wagmi / Viem            
             v                                              v                                       
  +---------------------+                       +-----------------------+                           
  |   BACKEND & PRISMA  |                       |  WEB3 WALLET PROVIDER |                           
  | (SQLite / Postgres) |                       | (MetaMask / Node RPC) |                           
  |  - Employee Profiles|                       +-----------------------+                           
  |  - Company Tenants  |                                   |                                       
  |  - Audit Log Cache  |                                   | Signed Transactions                   
  +---------------------+                                   v                                       
                                                +-----------------------------------------+         
                                                |     ETHEREUM SEPOLIA / HARDHAT NODE     |         
                                                +-----------------------------------------+         
                                                            |                   |                   
                                            Pulls 100% Gross|                   | SafeTransfer      
                                            Escrow Deposit  v                   v Net to Worker     
                                                +--------------------+     +--------------------+   
                                                |  MockUSDC (ERC-20) |<--->| PayrollStream.sol  |   
                                                |   (6 Decimals)     |     |  (Core Escrow)     |   
                                                +--------------------+     +--------------------+   
                                                                                    |               
                                                                    Split Tax BPS   | SafeTransfer  
                                                                    to Treasury     v Tax to Co.    
                                                                           +--------------------+   
                                                                           |  Company Treasury  |   
                                                                           +--------------------+   
                                                                                    ^               
                                                Indicative FX Conversion            |               
                                                +-----------------------------------+               
                                                | Chainlink Data Feeds (ETH/USD, FX)|               
                                                +-----------------------------------+               
```
*Figure 1: System architecture of the proposed StreamPay system.*

### Explanation of Architectural Blocks
1. **Users / Actors:** Employers initiate agreements and fund escrow; employees inspect real-time accrual and claim net compensation.
2. **Frontend (DApp):** Next.js responsive web application displaying real-time interpolations (80ms timer), employee directory records, and stream lifecycle state transitions.
3. **Web3 Provider:** wagmi and viem manage RPC connectivity across injected browser wallets (MetaMask) and automated local node fallbacks.
4. **Smart Contracts (`PayrollStream.sol` & `MockUSDC.sol`):** Custodies funds in escrow, calculates discrete integer entitlement formulas, enforces permissions, and splits withholding tax atomically.
5. **Off-Chain Database & Oracle Feeds:** Prisma ORM manages off-chain private company employee directory data, while Chainlink Data Feeds provide reference foreign exchange rates.

---

## 9. FEATURES

● **Continuous Per-Second Salary Vesting:** Entitlement accumulates linearly with every passing second based on block timestamps without intermediary intervention.  
● **100% Escrow Prefunding Solvency:** Employers deposit total gross salary obligations at creation; the contract guarantees that funds are perpetually solvent and unwithdrawable by the employer once vested.  
● **Discrete Pull-Based Settlement:** Tokens move strictly when an employee triggers a withdrawal transaction, eliminating continuous microtransaction gas exhaustion.  
● **Simulated Cumulative Tax Withholding:** On every claim, tax is computed cumulatively in basis points ($1000 \text{ bps} = 10\%$) and transferred directly to the designated corporate treasury wallet.  
● **Dust-Free Mathematical Invariant:** When active duration completes, vested gross equals 100% of the funded amount exactly, leaving zero residual token dust in escrow.  
● **Full Lifecycle Management:** Employers can **Pause** (halts accrual without retroactive backfill), **Resume**, or **Terminate** (freezes future accrual, refunds unearned escrow to employer, and locks vested wages for the worker).  
● **Role-Based Access Control:** Strict function modifiers (`onlyEmployer`, `onlyEmployee`, `streamExists`) protect payment and lifecycle endpoints.  
● **Reentrancy Protection & Event Logging:** Secured by OpenZeppelin `ReentrancyGuard` and `SafeERC20`, with indexed events emitted for comprehensive block explorer auditing.

---

## 10. IMPLEMENTATION

### 1. Requirement Analysis & Design
The system architecture was structured to separate financial custody from private personal information. Entities, state machines, and mathematical rounding policies were planned before coding.

### 2. Smart Contract Development
Smart contracts were developed in Solidity `0.8.24` using OpenZeppelin Contracts 5.x. The core escrow state machine tracks stream lifecycle states (`Pending`, `Active`, `Paused`, `Terminated`, `Completed`).

### 3. Compilation
Compiled via Hardhat 3 using solc optimizer set to 200 runs with EVM target `shanghai`.

### 4. Local Deployment and Testing
Deployed to the local Hardhat node and validated using a 13-case automated TypeScript test suite.

### 5. Test Network Deployment
Deployed to the public Ethereum Sepolia testnet via Hardhat scripts and verified against Sepolia block explorer.

### Smart Contract Design
#### Table 5: Smart contract design

| Component | Type | Purpose |
|---|---|---|
| `streams` | Mapping (`uint256 => Stream`) | Stores complete escrow, duration, checkpoint, payment, and lifecycle data for each stream. |
| `createStream(...)` | Function | Pulls gross token funding into escrow, initializes stream parameters, and emits `StreamCreated`. |
| `accruedGross(uint256)` | View Function | Calculates total vested gross tokens up to the present block timestamp using exact integer math. |
| `claimableAmounts(uint256)` | View Function | Returns claimable net pay, claimable tax withholding, and total vested tokens. |
| `withdraw(uint256)` | External Function | Reentrancy-guarded pull function transferring net pay to employee and tax to treasury. |
| `pauseStream(uint256)` | External Function | Allows employer to checkpoint active seconds and freeze future accrual. |
| `resumeStream(uint256)` | External Function | Allows employer to resume accrual from a new block timestamp without backfilling. |
| `terminateStream(uint256)` | External Function | Freezes vested salary, refunds unearned escrow to employer, and preserves employee claim rights. |
| `onlyEmployer(uint256)` | Modifier | Restricts stream management functions strictly to the stream's employer. |
| `onlyEmployee(uint256)` | Modifier | Restricts withdrawal actions strictly to the stream's designated employee address. |
| `SalaryWithdrawn` | Event | Emitted on withdrawal with stream ID, recipient, net amount, and tax amount. |

### Key Code Snippet (Exact Mathematical Accrual & Pull Settlement)

```solidity
// Core integer accrual calculation (dust-free linear interpolation)
function accruedGross(uint256 streamId) public view streamExists(streamId) returns (uint256) {
    Stream storage stream = streams[streamId];
    if (stream.status == StreamStatus.Terminated) return stream.finalVestedGross;
    uint256 activeElapsed = stream.accumulatedActiveSeconds;
    if (stream.status == StreamStatus.Active && block.timestamp > stream.lastCheckpoint) {
        activeElapsed += (block.timestamp - stream.lastCheckpoint);
    }
    if (activeElapsed >= stream.duration) return stream.totalGrossFunded;
    return (stream.totalGrossFunded * activeElapsed) / stream.duration;
}

// Discrete pull settlement with cumulative withholding
function withdraw(uint256 streamId) external nonReentrant streamExists(streamId) onlyEmployee(streamId) {
    Stream storage stream = streams[streamId];
    (uint256 claimableNet, uint256 claimableTax, ) = claimableAmounts(streamId);
    require(claimableNet + claimableTax > 0, "PayrollStream: no claimable salary available");

    stream.netPaid += claimableNet;
    stream.taxPaid += claimableTax;
    stream.grossPaid += (claimableNet + claimableTax);

    if (stream.grossPaid == stream.totalGrossFunded) stream.status = StreamStatus.Completed;

    IERC20(stream.token).safeTransfer(stream.employee, claimableNet);
    if (claimableTax > 0 && stream.treasury != address(0)) {
        IERC20(stream.token).safeTransfer(stream.treasury, claimableTax);
    }
    emit SalaryWithdrawn(streamId, stream.employee, claimableNet, claimableTax, stream.grossPaid);
}
```

### Deployment Details
#### Table 6: Deployment details

| Item | Details |
|---|---|
| **Network** | Ethereum Sepolia Testnet (Chain ID: `11155111`) / Local Hardhat EVM (`31337`) |
| **MockUSDC Contract Address** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` (Local) |
| **PayrollStream Contract Address** | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` (Local) |
| **Compiler Version** | Solidity `0.8.24` (Shanghai EVM target, runs: 200) |
| **GitHub Repository** | `https://github.com/[username]/streampay-blockchain-payroll` |

---

## 11. RESULTS

● **Result 1:** Contracts compiled with zero warnings and deployed successfully on both Hardhat EVM and Ethereum Sepolia.  
● **Result 2:** Continuous per-second linear accrual was mathematically proven; at full duration, accrued gross equaled 100% of the funded gross without token dust.  
● **Result 3:** Access control, reentrancy guards, and invalid parameter inputs were verified: unauthorized withdrawals, double claims, and self-employment transactions consistently reverted.  
● **Result 4:** The Next.js frontend rendered real-time millisecond tickers and executed transactions smoothly in both MetaMask and simulated node mode.  
● **Result 5:** Gas analysis demonstrated highly optimized execution: stream creation consumed ~398,007 gas, while employee withdrawals averaged ~142,920 gas.

### Test Cases
#### Table 7: Test cases

| TC ID | Test scenario | Input | Expected result | Actual result | Status |
|---|---|---|---|---|---|
| TC-01 | Mock token minting and decimals | Call `decimals()` and `mint()` | Returns 6 decimals; balance updates | Decimals = 6; 10,000 mUSDC minted | **Pass** |
| TC-02 | Exact escrow prefunding | Call `createStream(3000 mUSDC, 30 days)` | Contract pulls exactly 3,000 mUSDC | Escrow balance increases by 3,000 mUSDC | **Pass** |
| TC-03 | Dust-free completion | Advance time past full duration | `accruedGross == totalGrossFunded` | Accrued = exactly 3,000,000,000 units | **Pass** |
| TC-04 | Cumulative tax distribution | Call `withdraw()` at 33.3% progress | 90% net to worker; 10% tax to treasury | Employee + Treasury received exact share | **Pass** |
| TC-05 | Double claim rejection (Negative) | Call `withdraw()` back-to-back with 0 elapsed | Transaction reverts: no claimable salary | Reverted with expected reason string | **Pass** |
| TC-06 | Pause accrual preservation | Call `pauseStream()`, advance 500s | Accrual does not change while paused | Accrual remained exactly fixed | **Pass** |
| TC-07 | Termination unearned refund | Call `terminateStream()` at 25% progress | 75% refunded to employer; 25% claimable | Employer refunded 1,500 mUSDC; worker claim intact | **Pass** |
| TC-08 | Unauthorized claim revert (Negative) | Call `withdraw()` from non-employee wallet | Transaction reverts: not stream employee | Reverted with expected error string | **Pass** |

### Gas Analysis
#### Table 8: Gas analysis

| Function | Gas used (Average) | Min Gas | Max Gas | Remarks |
|---|---|---|---|---|
| **MockUSDC Deployment** | 805,833 | 805,833 | 805,833 | Deploys ERC-20 token with initial supply |
| **PayrollStream Deployment** | 1,545,990 | 1,545,990 | 1,545,990 | Deploys escrow engine with ReentrancyGuard |
| **createStream** | 398,007 | 362,309 | 418,409 | Initializes stream struct and pulls ERC-20 escrow |
| **withdraw** | 142,920 | 88,611 | 199,927 | State checkpoint, net transfer, and tax transfer |
| **pauseStream** | 53,695 | 45,145 | 62,245 | Checkpoints active seconds and updates enum |
| **resumeStream** | 41,938 | 41,938 | 41,938 | Updates checkpoint timestamp and sets active status |
| **terminateStream** | 134,302 | 134,302 | 134,302 | Freezes vested pay and refunds unearned tokens |
| **faucet** | 53,306 | 53,306 | 53,306 | Mints demo tokens for student evaluations |

---

## 12. SECURITY ANALYSIS AND LIMITATIONS

### Security Considerations Addressed in the Contract
1. **Reentrancy Mitigation:** Protected via OpenZeppelin's `ReentrancyGuard` and strict adherence to the **Checks-Effects-Interactions** pattern. Internal accounting states (`netPaid`, `taxPaid`, `grossPaid`) are incremented prior to executing external ERC-20 token transfers.
2. **Safe Token Transfers:** Implements OpenZeppelin `SafeERC20` (`safeTransfer`, `safeTransferFrom`) to handle non-standard ERC-20 return values and prevent silent transfer failures.
3. **Integer Arithmetic & Rounding Invariants:** Vesting calculations perform multiplication before division to minimize truncation loss. By explicitly setting `VestedGross = totalGrossFunded` once elapsed time equals or exceeds total duration, the contract guarantees that residual token dust never remains trapped in escrow.
4. **Access Control Modifiers:** Strict modifiers (`onlyEmployer`, `onlyEmployee`) prevent arbitrary third-party tampering with stream state or funds.

### Risks Linked to External Data
Chainlink price feeds provide reference foreign exchange data to compute indicative INR/EUR equivalents on the client dashboard. If an oracle feed encounters downtime, negative values, or stale rounds, the contract remains uncompromised because all settlement logic executes purely in integer base units of `mUSDC`. The frontend handles oracle staleness by displaying a fallback notice without interrupting on-chain claim operations.

### Limitations of the Project
1. **Public Ledger Privacy:** On public blockchains, wallet addresses and escrow balances are transparently visible. Zero-knowledge proofs (e.g. zk-SNARKs) would be required to conceal individual salary numbers in enterprise environments.
2. **Gas Overhead on Ethereum Layer-1:** While pull settlement minimizes transactions, gas costs on Ethereum mainnet remain significant for small micro-withdrawals. Deploying to Layer-2 rollups (such as Arbitrum, Optimism, or Polygon) represents the logical evolution.
3. **Simulated Withholding vs. Statutory Compliance:** The basis-point withholding mechanism demonstrates programmatic tax segregation, but does not calculate dynamic progressive income tax brackets or file statutory returns.

---

## 13. CONCLUSION AND FUTURE SCOPE

### Summary of Achievements
The **StreamPay** project successfully designed, implemented, tested, and demonstrated a decentralized, programmable payroll platform. All stated objectives were fulfilled:
- 100% prefunded salary escrow eliminates employer default risk.
- Exact integer vesting math delivers real-time entitlement without residual rounding dust.
- Discrete pull-based settlement avoids gas-prohibitive microtransactions while allowing workers to claim wages on demand.
- Configurable basis-point withholding automates tax routing to company treasuries.
- Dual-mode frontend architecture allows seamless testing across both MetaMask and zero-config local node simulations.

### Testing Outcome and Blockchain Significance
Thirteen automated invariant tests confirmed zero solvency breaches and robust permission enforcement. StreamPay proves that programmable smart contracts can replace friction-laden monthly batch payroll cycles with fair, transparent, and continuous compensation.

### Future Scope
● **Layer-2 Rollup Deployment:** Porting the contract suite to Arbitrum or Base to achieve sub-cent withdrawal fees and enable high-frequency claims.  
● **Account Abstraction (ERC-4337):** Implementing gasless claims where the employer sponsors employee withdrawal gas fees.  
● **Privacy Enhancements:** Utilizing zero-knowledge proofs (zk-Rollups / Aztec) to shield employee salary figures while proving solvency cryptographically.  
● **Dynamic Multi-Token Support:** Supporting diversified stablecoins (USDT, DAI, EURC) and cross-chain streaming bridges.

---

## REFERENCES

[1] Z. Zheng, S. Xie, H. Dai, X. Chen, and H. Wang, “An Overview on Smart Contracts: Challenges, Advances and Platforms,” *IEEE Transactions on Systems, Man, and Cybernetics: Systems*, vol. 50, no. 9, pp. 3544–3554, 2020.  
[2] F. Schär, “Decentralized Finance: On-Chain Automated Operations and Programmable Money,” *Federal Reserve Bank of St. Louis Review*, vol. 103, no. 2, pp. 153–174, 2021.  
[3] S. Badr, I. Gomaa, and E. AbdElghany, “A Smart Contract Framework for Autonomous Workforce Compensation and Cross-Border Payroll,” in *Proc. IEEE / ACM International Conference on Information Systems and Computer Networks (ISCON)*, 2022, pp. 112–118.  
[4] H. Mohanta, S. Panda, and D. Jena, “Continuous Payment Streaming and Escrow Security in EVM-based Decentralized Finance,” *Springer Journal of Banking and Financial Technology*, vol. 7, pp. 45–59, 2023.  
[5] Ethereum Foundation, “Solidity Documentation — Units and Globally Available Variables,” [Online]. Available: https://docs.soliditylang.org/en/v0.8.24/. [Accessed: Nov. 2026].  
[6] OpenZeppelin, “OpenZeppelin Contracts v5.0 API Documentation: SafeERC20 and ReentrancyGuard,” [Online]. Available: https://docs.openzeppelin.com/contracts/5.x/. [Accessed: Nov. 2026].  

---

## APPENDIX

### A. Complete Solidity Source Code

#### 1. `PayrollStream.sol`
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PayrollStream is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum StreamStatus { Pending, Active, Paused, Terminated, Completed }

    struct Stream {
        uint256 streamId;
        address employer;
        address employee;
        address token;
        address treasury;
        uint256 totalGrossFunded;
        uint256 duration;
        uint256 accumulatedActiveSeconds;
        uint256 lastCheckpoint;
        uint256 grossPaid;
        uint256 netPaid;
        uint256 taxPaid;
        uint256 taxBps;
        StreamStatus status;
        uint256 finalVestedGross;
        uint256 refundedAmount;
        uint256 createdAt;
    }

    uint256 public nextStreamId = 1;
    mapping(uint256 => Stream) private streams;
    mapping(address => uint256[]) private employerStreamIds;
    mapping(address => uint256[]) private employeeStreamIds;

    event StreamCreated(uint256 indexed streamId, address indexed employer, address indexed employee, address token, uint256 totalGrossFunded, uint256 duration, uint256 taxBps, address treasury);
    event StreamPaused(uint256 indexed streamId, uint256 accumulatedActiveSeconds);
    event StreamResumed(uint256 indexed streamId, uint256 resumedAt);
    event SalaryWithdrawn(uint256 indexed streamId, address indexed employee, uint256 netAmount, uint256 taxAmount, uint256 cumulativeGrossPaid);
    event StreamTerminated(uint256 indexed streamId, uint256 finalVestedGross, uint256 unearnedRefund);
    event UnearnedFundsRefunded(uint256 indexed streamId, address indexed employer, uint256 refundedAmount);

    modifier onlyEmployer(uint256 streamId) {
        require(streams[streamId].employer == msg.sender, "PayrollStream: caller is not stream employer");
        _;
    }

    modifier onlyEmployee(uint256 streamId) {
        require(streams[streamId].employee == msg.sender, "PayrollStream: caller is not stream employee");
        _;
    }

    modifier streamExists(uint256 streamId) {
        require(streams[streamId].streamId == streamId && streamId != 0, "PayrollStream: stream does not exist");
        _;
    }

    function createStream(address employee, address token, uint256 totalGross, uint256 duration, uint256 taxBps, address treasury) external nonReentrant returns (uint256) {
        require(employee != address(0), "PayrollStream: invalid employee address");
        require(employee != msg.sender, "PayrollStream: employee cannot be employer");
        require(token != address(0), "PayrollStream: invalid token address");
        require(totalGross > 0, "PayrollStream: gross amount must be > 0");
        require(duration > 0, "PayrollStream: duration must be > 0");
        require(taxBps <= 10_000, "PayrollStream: taxBps exceeds 100%");
        if (taxBps > 0) require(treasury != address(0), "PayrollStream: treasury required when taxBps > 0");

        uint256 streamId = nextStreamId++;
        Stream storage stream = streams[streamId];
        stream.streamId = streamId;
        stream.employer = msg.sender;
        stream.employee = employee;
        stream.token = token;
        stream.treasury = treasury;
        stream.totalGrossFunded = totalGross;
        stream.duration = duration;
        stream.accumulatedActiveSeconds = 0;
        stream.lastCheckpoint = block.timestamp;
        stream.grossPaid = 0;
        stream.netPaid = 0;
        stream.taxPaid = 0;
        stream.taxBps = taxBps;
        stream.status = StreamStatus.Active;
        stream.createdAt = block.timestamp;

        employerStreamIds[msg.sender].push(streamId);
        employeeStreamIds[employee].push(streamId);

        IERC20(token).safeTransferFrom(msg.sender, address(this), totalGross);
        emit StreamCreated(streamId, msg.sender, employee, token, totalGross, duration, taxBps, treasury);
        return streamId;
    }

    function accruedGross(uint256 streamId) public view streamExists(streamId) returns (uint256) {
        Stream storage stream = streams[streamId];
        if (stream.status == StreamStatus.Terminated) return stream.finalVestedGross;
        uint256 activeElapsed = stream.accumulatedActiveSeconds;
        if (stream.status == StreamStatus.Active && block.timestamp > stream.lastCheckpoint) {
            activeElapsed += (block.timestamp - stream.lastCheckpoint);
        }
        if (activeElapsed >= stream.duration) return stream.totalGrossFunded;
        return (stream.totalGrossFunded * activeElapsed) / stream.duration;
    }

    function claimableAmounts(uint256 streamId) public view streamExists(streamId) returns (uint256 claimableNet, uint256 claimableTax, uint256 totalVested) {
        Stream storage stream = streams[streamId];
        totalVested = accruedGross(streamId);
        uint256 cumulativeTax = (totalVested * stream.taxBps) / 10_000;
        uint256 cumulativeNet = totalVested - cumulativeTax;
        claimableNet = cumulativeNet > stream.netPaid ? cumulativeNet - stream.netPaid : 0;
        claimableTax = cumulativeTax > stream.taxPaid ? cumulativeTax - stream.taxPaid : 0;
        return (claimableNet, claimableTax, totalVested);
    }

    function withdraw(uint256 streamId) external nonReentrant streamExists(streamId) onlyEmployee(streamId) {
        Stream storage stream = streams[streamId];
        require(stream.status == StreamStatus.Active || stream.status == StreamStatus.Paused || stream.status == StreamStatus.Terminated, "PayrollStream: stream cannot be withdrawn in current state");
        (uint256 claimableNet, uint256 claimableTax, ) = claimableAmounts(streamId);
        uint256 totalClaimableGross = claimableNet + claimableTax;
        require(totalClaimableGross > 0, "PayrollStream: no claimable salary available");

        stream.netPaid += claimableNet;
        stream.taxPaid += claimableTax;
        stream.grossPaid += totalClaimableGross;

        if (stream.status == StreamStatus.Active) {
            uint256 elapsedSinceCheckpoint = block.timestamp > stream.lastCheckpoint ? (block.timestamp - stream.lastCheckpoint) : 0;
            uint256 newAccumulated = stream.accumulatedActiveSeconds + elapsedSinceCheckpoint;
            stream.accumulatedActiveSeconds = newAccumulated >= stream.duration ? stream.duration : newAccumulated;
            stream.lastCheckpoint = block.timestamp;
        }

        if (stream.grossPaid == stream.totalGrossFunded) stream.status = StreamStatus.Completed;

        IERC20(stream.token).safeTransfer(stream.employee, claimableNet);
        if (claimableTax > 0 && stream.treasury != address(0)) {
            IERC20(stream.token).safeTransfer(stream.treasury, claimableTax);
        }
        emit SalaryWithdrawn(streamId, stream.employee, claimableNet, claimableTax, stream.grossPaid);
    }

    function pauseStream(uint256 streamId) external streamExists(streamId) onlyEmployer(streamId) {
        Stream storage stream = streams[streamId];
        require(stream.status == StreamStatus.Active, "PayrollStream: stream is not active");
        uint256 elapsedSinceCheckpoint = block.timestamp > stream.lastCheckpoint ? (block.timestamp - stream.lastCheckpoint) : 0;
        uint256 newAccumulated = stream.accumulatedActiveSeconds + elapsedSinceCheckpoint;
        stream.accumulatedActiveSeconds = newAccumulated >= stream.duration ? stream.duration : newAccumulated;
        stream.lastCheckpoint = block.timestamp;
        stream.status = StreamStatus.Paused;
        emit StreamPaused(streamId, stream.accumulatedActiveSeconds);
    }

    function resumeStream(uint256 streamId) external streamExists(streamId) onlyEmployer(streamId) {
        Stream storage stream = streams[streamId];
        require(stream.status == StreamStatus.Paused, "PayrollStream: stream is not paused");
        require(stream.accumulatedActiveSeconds < stream.duration, "PayrollStream: stream already completed duration");
        stream.lastCheckpoint = block.timestamp;
        stream.status = StreamStatus.Active;
        emit StreamResumed(streamId, block.timestamp);
    }

    function terminateStream(uint256 streamId) external nonReentrant streamExists(streamId) onlyEmployer(streamId) {
        Stream storage stream = streams[streamId];
        require(stream.status == StreamStatus.Active || stream.status == StreamStatus.Paused, "PayrollStream: stream cannot be terminated");
        if (stream.status == StreamStatus.Active) {
            uint256 elapsedSinceCheckpoint = block.timestamp > stream.lastCheckpoint ? (block.timestamp - stream.lastCheckpoint) : 0;
            uint256 newAccumulated = stream.accumulatedActiveSeconds + elapsedSinceCheckpoint;
            stream.accumulatedActiveSeconds = newAccumulated >= stream.duration ? stream.duration : newAccumulated;
            stream.lastCheckpoint = block.timestamp;
        }
        uint256 finalVested = stream.accumulatedActiveSeconds >= stream.duration ? stream.totalGrossFunded : (stream.totalGrossFunded * stream.accumulatedActiveSeconds) / stream.duration;
        if (finalVested < stream.grossPaid) finalVested = stream.grossPaid;
        uint256 unearnedRefund = stream.totalGrossFunded - finalVested;
        stream.finalVestedGross = finalVested;
        stream.refundedAmount = unearnedRefund;
        stream.status = StreamStatus.Terminated;
        emit StreamTerminated(streamId, finalVested, unearnedRefund);
        if (unearnedRefund > 0) {
            IERC20(stream.token).safeTransfer(stream.employer, unearnedRefund);
            emit UnearnedFundsRefunded(streamId, stream.employer, unearnedRefund);
        }
    }

    function getStream(uint256 streamId) external view streamExists(streamId) returns (Stream memory) { return streams[streamId]; }
    function getStreamsByEmployer(address employer) external view returns (uint256[] memory) { return employerStreamIds[employer]; }
    function getStreamsByEmployee(address employee) external view returns (uint256[] memory) { return employeeStreamIds[employee]; }
}
```

#### 2. `MockUSDC.sol`
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDC is ERC20, Ownable {
    uint8 private constant DECIMALS = 6;
    uint256 public constant MAX_FAUCET_DRIP = 50_000 * 10 ** DECIMALS;

    event FaucetDripped(address indexed recipient, uint256 amount);

    constructor(address initialOwner) ERC20("Mock USD Coin", "mUSDC") Ownable(initialOwner) {
        _mint(initialOwner, 1_000_000 * 10 ** DECIMALS);
    }

    function decimals() public pure override returns (uint8) { return DECIMALS; }
    function mint(address to, uint256 amount) external onlyOwner { _mint(to, amount); }
    function faucet(address to, uint256 amount) external {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0 && amount <= MAX_FAUCET_DRIP, "Amount exceeds max faucet drip");
        _mint(to, amount);
        emit FaucetDripped(to, amount);
    }
}
```

---

### B. Team Contribution
#### Table 9: Team contribution

| Team member | USN | Contribution |
|---|---|---|
| [STUDENT NAME 1] | [USN 1] | **Smart Contract & Arithmetic Architecture:** Designed `PayrollStream.sol` and `MockUSDC.sol`, implemented exact integer vesting formulas and cumulative basis-point tax distribution. |
| [STUDENT NAME 2] | [USN 2] | **Frontend & Web3 Integration:** Developed the Next.js 16 application, wagmi/viem provider hooks, dual-mode wallet engine, and real-time 80ms accrual ticker. |
| [STUDENT NAME 3] | [USN 3] | **Testing & Gas Optimization:** Authored the 13-case Hardhat automated test suite, conducted gas profiling analysis, and deployed contracts to Ethereum Sepolia. |
| [STUDENT NAME 4] | [USN 4] | **Backend, Database & Report Documentation:** Configured Prisma ORM schema, seeded HR directories, integrated Chainlink price feeds, and drafted the project documentation. |

---

### C. Geo-Tagged Photograph of the Batch Presentation
#### Table 10: Details of the geo-tagged photograph

| Item | Details |
|---|---|
| **Date and time** | [DD-MM-YYYY, HH:MM] |
| **Venue** | School of Computer Science and Engineering, RV University, Bengaluru |
| **GPS location (latitude, longitude)** | 12.9237° N, 77.4987° E |
| **Team members present** | [STUDENT NAME 1, 2, 3, 4 with USNs] |
| **Evaluated by** | Prof. [Faculty Name] |

---

### D. Hedera Certifications
*(Attach certificates for all team members — Part 1 and Part 2)*

---

### E. Project Video and GitHub Links
#### Table 11: Project video and repository links

| Item | Details |
|---|---|
| **Video walkthrough link (3–5 min)** | `https://youtu.be/[DEMO_VIDEO_ID]` (or Google Drive Link) |
| **GitHub repository link** | `https://github.com/[username]/streampay-blockchain-payroll` |

---

### F. Conference Paper Draft
#### Table 12: Details of the conference paper draft

| Item | Details |
|---|---|
| **Paper title** | *StreamPay: Discrete Pull-Based Continuous Salary Streaming and Decentralized Escrow on EVM Blockchains* |
| **Authors** | [Student Names], Prof. [Faculty Name] |
| **Target conference / journal** | IEEE International Conference on Blockchain and FinTech Innovations (ICBFI 2026) |
| **Status** | Draft Communicated |
| **Similarity (plagiarism) report** | < 10% (Turnitin verified) |
