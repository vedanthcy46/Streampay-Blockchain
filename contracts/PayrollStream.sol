// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PayrollStream
 * @notice Programmable salary escrow and continuous vesting smart contract.
 * @dev Enforces continuous accrual with discrete pull-based withdrawals,
 *      reentrancy protection, configurable tax withholding, and lifecycle controls.
 */
contract PayrollStream is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum StreamStatus {
        Pending,
        Active,
        Paused,
        Terminated,
        Completed
    }

    struct Stream {
        uint256 streamId;
        address employer;
        address employee;
        address token;
        address treasury;
        uint256 totalGrossFunded;
        uint256 duration;                // Total active duration in seconds
        uint256 accumulatedActiveSeconds;// Cumulative active seconds up to lastCheckpoint
        uint256 lastCheckpoint;          // Timestamp of last status change or claim
        uint256 grossPaid;               // Total gross claimed (net + tax)
        uint256 netPaid;                 // Total net paid to employee
        uint256 taxPaid;                 // Total withholding paid to treasury
        uint256 taxBps;                  // Basis points (e.g. 1000 = 10.00%, max 10000)
        StreamStatus status;
        uint256 finalVestedGross;        // Locked vested amount upon termination
        uint256 refundedAmount;          // Amount refunded to employer upon termination
        uint256 createdAt;               // Stream creation timestamp
    }

    uint256 public nextStreamId = 1;

    // streamId => Stream
    mapping(uint256 => Stream) private streams;

    // Indexing helpers
    mapping(address => uint256[]) private employerStreamIds;
    mapping(address => uint256[]) private employeeStreamIds;

    // Events matching specifications
    event StreamCreated(
        uint256 indexed streamId,
        address indexed employer,
        address indexed employee,
        address token,
        uint256 totalGrossFunded,
        uint256 duration,
        uint256 taxBps,
        address treasury
    );

    event StreamPaused(uint256 indexed streamId, uint256 accumulatedActiveSeconds);
    event StreamResumed(uint256 indexed streamId, uint256 resumedAt);
    event SalaryWithdrawn(
        uint256 indexed streamId,
        address indexed employee,
        uint256 netAmount,
        uint256 taxAmount,
        uint256 cumulativeGrossPaid
    );
    event StreamTerminated(
        uint256 indexed streamId,
        uint256 finalVestedGross,
        uint256 unearnedRefund
    );
    event UnearnedFundsRefunded(
        uint256 indexed streamId,
        address indexed employer,
        uint256 refundedAmount
    );

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

    /**
     * @notice Creates a new pre-funded payroll stream.
     * @param employee The address of the employee receiving salary.
     * @param token ERC-20 payment token address.
     * @param totalGross Total salary amount funded into escrow.
     * @param duration Active duration in seconds (must be > 0).
     * @param taxBps Withholding tax basis points (0 to 10,000).
     * @param treasury Destination address for withheld tax (can be address(0) if taxBps == 0).
     * @return streamId The ID of the newly created stream.
     */
    function createStream(
        address employee,
        address token,
        uint256 totalGross,
        uint256 duration,
        uint256 taxBps,
        address treasury
    ) external nonReentrant returns (uint256) {
        require(employee != address(0), "PayrollStream: invalid employee address");
        require(employee != msg.sender, "PayrollStream: employee cannot be employer");
        require(token != address(0), "PayrollStream: invalid token address");
        require(totalGross > 0, "PayrollStream: gross amount must be > 0");
        require(duration > 0, "PayrollStream: duration must be > 0");
        require(taxBps <= 10_000, "PayrollStream: taxBps exceeds 100%");
        if (taxBps > 0) {
            require(treasury != address(0), "PayrollStream: treasury required when taxBps > 0");
        }

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
        stream.finalVestedGross = 0;
        stream.refundedAmount = 0;
        stream.createdAt = block.timestamp;

        employerStreamIds[msg.sender].push(streamId);
        employeeStreamIds[employee].push(streamId);

        // Pull full gross amount into escrow
        IERC20(token).safeTransferFrom(msg.sender, address(this), totalGross);

        emit StreamCreated(
            streamId,
            msg.sender,
            employee,
            token,
            totalGross,
            duration,
            taxBps,
            treasury
        );

        return streamId;
    }

    /**
     * @notice Calculates total gross salary vested up to the present block.
     * @param streamId The ID of the stream.
     * @return Gross vested tokens in base units.
     */
    function accruedGross(uint256 streamId) public view streamExists(streamId) returns (uint256) {
        Stream storage stream = streams[streamId];

        if (stream.status == StreamStatus.Terminated) {
            return stream.finalVestedGross;
        }

        uint256 activeElapsed = stream.accumulatedActiveSeconds;

        if (stream.status == StreamStatus.Active) {
            if (block.timestamp > stream.lastCheckpoint) {
                activeElapsed += (block.timestamp - stream.lastCheckpoint);
            }
        }

        if (activeElapsed >= stream.duration) {
            return stream.totalGrossFunded;
        }

        // Integer math: floor(totalGrossFunded * activeElapsed / duration)
        return (stream.totalGrossFunded * activeElapsed) / stream.duration;
    }

    /**
     * @notice Returns claimable net and tax amounts as well as total vested gross.
     */
    function claimableAmounts(uint256 streamId)
        public
        view
        streamExists(streamId)
        returns (uint256 claimableNet, uint256 claimableTax, uint256 totalVested)
    {
        Stream storage stream = streams[streamId];
        totalVested = accruedGross(streamId);

        uint256 cumulativeTax = (totalVested * stream.taxBps) / 10_000;
        uint256 cumulativeNet = totalVested - cumulativeTax;

        claimableNet = cumulativeNet > stream.netPaid ? cumulativeNet - stream.netPaid : 0;
        claimableTax = cumulativeTax > stream.taxPaid ? cumulativeTax - stream.taxPaid : 0;

        return (claimableNet, claimableTax, totalVested);
    }

    /**
     * @notice Employee claims all accrued, unwithdrawn earnings.
     * @dev Automatically distributes net pay to employee and withholding tax to treasury.
     * @param streamId The ID of the stream.
     */
    function withdraw(uint256 streamId) external nonReentrant streamExists(streamId) onlyEmployee(streamId) {
        Stream storage stream = streams[streamId];
        require(
            stream.status == StreamStatus.Active ||
            stream.status == StreamStatus.Paused ||
            stream.status == StreamStatus.Terminated,
            "PayrollStream: stream cannot be withdrawn in current state"
        );

        (uint256 claimableNet, uint256 claimableTax, ) = claimableAmounts(streamId);
        uint256 totalClaimableGross = claimableNet + claimableTax;

        require(totalClaimableGross > 0, "PayrollStream: no claimable salary available");

        // Checks-Effects: update state before transfers
        stream.netPaid += claimableNet;
        stream.taxPaid += claimableTax;
        stream.grossPaid += totalClaimableGross;

        // If stream is active, checkpoint active seconds up to now
        if (stream.status == StreamStatus.Active) {
            uint256 elapsedSinceCheckpoint = block.timestamp > stream.lastCheckpoint
                ? (block.timestamp - stream.lastCheckpoint)
                : 0;
            uint256 newAccumulated = stream.accumulatedActiveSeconds + elapsedSinceCheckpoint;
            if (newAccumulated >= stream.duration) {
                stream.accumulatedActiveSeconds = stream.duration;
            } else {
                stream.accumulatedActiveSeconds = newAccumulated;
            }
            stream.lastCheckpoint = block.timestamp;
        }

        // Check if stream is fully completed
        if (stream.grossPaid == stream.totalGrossFunded) {
            stream.status = StreamStatus.Completed;
        }

        // External token transfers
        IERC20(stream.token).safeTransfer(stream.employee, claimableNet);

        if (claimableTax > 0 && stream.treasury != address(0)) {
            IERC20(stream.token).safeTransfer(stream.treasury, claimableTax);
        }

        emit SalaryWithdrawn(streamId, stream.employee, claimableNet, claimableTax, stream.grossPaid);
    }

    /**
     * @notice Pauses an active stream. Accrual stops until resumed.
     * @param streamId The ID of the stream.
     */
    function pauseStream(uint256 streamId) external streamExists(streamId) onlyEmployer(streamId) {
        Stream storage stream = streams[streamId];
        require(stream.status == StreamStatus.Active, "PayrollStream: stream is not active");

        uint256 elapsedSinceCheckpoint = block.timestamp > stream.lastCheckpoint
            ? (block.timestamp - stream.lastCheckpoint)
            : 0;
        uint256 newAccumulated = stream.accumulatedActiveSeconds + elapsedSinceCheckpoint;
        if (newAccumulated >= stream.duration) {
            newAccumulated = stream.duration;
        }

        stream.accumulatedActiveSeconds = newAccumulated;
        stream.lastCheckpoint = block.timestamp;
        stream.status = StreamStatus.Paused;

        emit StreamPaused(streamId, stream.accumulatedActiveSeconds);
    }

    /**
     * @notice Resumes a paused stream without retroactive accrual.
     * @param streamId The ID of the stream.
     */
    function resumeStream(uint256 streamId) external streamExists(streamId) onlyEmployer(streamId) {
        Stream storage stream = streams[streamId];
        require(stream.status == StreamStatus.Paused, "PayrollStream: stream is not paused");
        require(stream.accumulatedActiveSeconds < stream.duration, "PayrollStream: stream already completed duration");

        stream.lastCheckpoint = block.timestamp;
        stream.status = StreamStatus.Active;

        emit StreamResumed(streamId, block.timestamp);
    }

    /**
     * @notice Terminates an active or paused stream.
     * @dev Freezes accrued salary for the employee and refunds unearned escrow to the employer.
     * @param streamId The ID of the stream.
     */
    function terminateStream(uint256 streamId) external nonReentrant streamExists(streamId) onlyEmployer(streamId) {
        Stream storage stream = streams[streamId];
        require(
            stream.status == StreamStatus.Active || stream.status == StreamStatus.Paused,
            "PayrollStream: stream cannot be terminated"
        );

        if (stream.status == StreamStatus.Active) {
            uint256 elapsedSinceCheckpoint = block.timestamp > stream.lastCheckpoint
                ? (block.timestamp - stream.lastCheckpoint)
                : 0;
            uint256 newAccumulated = stream.accumulatedActiveSeconds + elapsedSinceCheckpoint;
            if (newAccumulated >= stream.duration) {
                newAccumulated = stream.duration;
            }
            stream.accumulatedActiveSeconds = newAccumulated;
            stream.lastCheckpoint = block.timestamp;
        }

        uint256 finalVested;
        if (stream.accumulatedActiveSeconds >= stream.duration) {
            finalVested = stream.totalGrossFunded;
        } else {
            finalVested = (stream.totalGrossFunded * stream.accumulatedActiveSeconds) / stream.duration;
        }

        // Safety invariant: finalVested must never be less than what has already been claimed
        if (finalVested < stream.grossPaid) {
            finalVested = stream.grossPaid;
        }

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

    /**
     * @notice View function to retrieve stream details.
     */
    function getStream(uint256 streamId) external view streamExists(streamId) returns (Stream memory) {
        return streams[streamId];
    }

    /**
     * @notice Returns all stream IDs initiated by an employer.
     */
    function getStreamsByEmployer(address employer) external view returns (uint256[] memory) {
        return employerStreamIds[employer];
    }

    /**
     * @notice Returns all stream IDs assigned to an employee.
     */
    function getStreamsByEmployee(address employee) external view returns (uint256[] memory) {
        return employeeStreamIds[employee];
    }
}
