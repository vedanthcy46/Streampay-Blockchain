// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @notice Demonstration ERC-20 token with 6 decimals for academic payroll simulation.
 * @dev Not a real stablecoin. Has no monetary value.
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private constant DECIMALS = 6;
    uint256 public constant MAX_FAUCET_DRIP = 50_000 * 10 ** DECIMALS; // 50,000 mUSDC

    event FaucetDripped(address indexed recipient, uint256 amount);

    constructor(address initialOwner) ERC20("Mock USD Coin", "mUSDC") Ownable(initialOwner) {
        // Mint initial supply of 1,000,000 mUSDC to the deployer
        _mint(initialOwner, 1_000_000 * 10 ** DECIMALS);
    }

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @notice Admin minting function
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Academic demo faucet to allow testers/employers to self-fund demo accounts.
     * @param to Recipient address
     * @param amount Token amount in base units (max 50,000 mUSDC per drip)
     */
    function faucet(address to, uint256 amount) external {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0 && amount <= MAX_FAUCET_DRIP, "Amount exceeds max faucet drip");
        _mint(to, amount);
        emit FaucetDripped(to, amount);
    }
}
