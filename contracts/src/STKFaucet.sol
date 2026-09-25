// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract STKFaucet is Ownable {
    using SafeERC20 for IERC20;

    error STKFaucet__AlreadyClaimed();
    error STKFaucet__InsufficientFaucetBalance();
    error STKFaucet__InvalidTokenAddress();
    error STKFaucet__InvalidClaimAmount();

    IERC20 public immutable STAKING_TOKEN;
    uint256 public immutable CLAIM_AMOUNT;
    mapping(address => bool) public hasClaimed;

    event TokensClaimed(address indexed user, uint256 amount);
    event FaucetFunded(address indexed funder, uint256 amount);

    constructor(address _stakingToken, uint256 _claimAmount) Ownable(msg.sender) {
        if (_stakingToken == address(0)) revert STKFaucet__InvalidTokenAddress();
        if (_claimAmount == 0) revert STKFaucet__InvalidClaimAmount();

        STAKING_TOKEN = IERC20(_stakingToken);
        CLAIM_AMOUNT = _claimAmount;
    }

    function claim() external {
        if (hasClaimed[msg.sender]) revert STKFaucet__AlreadyClaimed();
        if (STAKING_TOKEN.balanceOf(address(this)) < CLAIM_AMOUNT) {
            revert STKFaucet__InsufficientFaucetBalance();
        }

        hasClaimed[msg.sender] = true;
        STAKING_TOKEN.safeTransfer(msg.sender, CLAIM_AMOUNT);

        emit TokensClaimed(msg.sender, CLAIM_AMOUNT);
    }

    function fund(uint256 amount) external onlyOwner {
        if (amount == 0) revert STKFaucet__InvalidClaimAmount();

        STAKING_TOKEN.safeTransferFrom(msg.sender, address(this), amount);

        emit FaucetFunded(msg.sender, amount);
    }
}
