export const SUPPORTED_CHAINS = {
  HARDHAT: 31337,
  SEPOLIA: 11155111,
} as const;

export enum StreamStatus {
  Pending = 0,
  Active = 1,
  Paused = 2,
  Terminated = 3,
  Completed = 4,
}

export const StreamStatusLabels: Record<StreamStatus, string> = {
  [StreamStatus.Pending]: "Pending",
  [StreamStatus.Active]: "Active",
  [StreamStatus.Paused]: "Paused",
  [StreamStatus.Terminated]: "Terminated",
  [StreamStatus.Completed]: "Completed",
};

export interface StreamData {
  streamId: string;
  employer: string;
  employee: string;
  token: string;
  treasury: string;
  totalGrossFunded: string; // Formatted or raw string
  totalGrossFundedRaw: bigint;
  duration: number; // in seconds
  accumulatedActiveSeconds: number;
  lastCheckpoint: number; // unix timestamp
  grossPaid: string;
  grossPaidRaw: bigint;
  netPaid: string;
  netPaidRaw: bigint;
  taxPaid: string;
  taxPaidRaw: bigint;
  taxBps: number;
  status: StreamStatus;
  finalVestedGross: string;
  finalVestedGrossRaw: bigint;
  refundedAmount: string;
  refundedAmountRaw: bigint;
  createdAt: number;
}

export interface EmployeeProfile {
  id: string;
  name: string;
  role: string;
  email?: string;
  walletAddress: string;
  monthlySalaryUSDC: number;
  companyId: string;
}

export interface CreateStreamInput {
  employeeAddress: string;
  tokenAddress: string;
  grossAmount: number; // In token units, e.g. 3000
  durationSeconds: number;
  taxPercentage: number; // e.g. 10 for 10% (1000 bps)
  treasuryAddress: string;
}

/**
 * Validates standard Ethereum hex address
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Calculates current vested gross based on client timestamp and stream checkpoints.
 */
export function calculateIndicativeVestedGross(
  stream: Pick<
    StreamData,
    "status" | "totalGrossFundedRaw" | "duration" | "accumulatedActiveSeconds" | "lastCheckpoint" | "finalVestedGrossRaw"
  >,
  currentTimestampSec: number
): bigint {
  if (stream.status === StreamStatus.Terminated) {
    return stream.finalVestedGrossRaw;
  }

  let activeElapsed = BigInt(stream.accumulatedActiveSeconds);

  if (stream.status === StreamStatus.Active) {
    const elapsedSinceLast =
      currentTimestampSec > stream.lastCheckpoint
        ? BigInt(currentTimestampSec - stream.lastCheckpoint)
        : 0n;
    activeElapsed += elapsedSinceLast;
  }

  const durationBig = BigInt(stream.duration);
  if (durationBig === 0n) return 0n;

  if (activeElapsed >= durationBig) {
    return stream.totalGrossFundedRaw;
  }

  return (stream.totalGrossFundedRaw * activeElapsed) / durationBig;
}
