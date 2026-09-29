// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Staking} from "../../src/Staking.sol";
import {StakingToken} from "../../src/StakingToken.sol";

contract StakingInvariantHandler is Test {
    Staking internal immutable staking;
    StakingToken internal immutable stakingToken;
    address internal immutable user;

    constructor(Staking _staking, StakingToken _stakingToken, address _user) {
        staking = _staking;
        stakingToken = _stakingToken;
        user = _user;
    }

    function stake(uint256 amount) external {
        if (staking.emergencyWithdrawn(user)) {
            return;
        }

        uint256 userBalance = stakingToken.balanceOf(user);

        if (userBalance == 0) {
            return;
        }

        amount = bound(amount, 1, userBalance);

        vm.prank(user);
        staking.stake(amount);
    }

    function unstake(uint256 amount) external {
        Staking.UserInfo memory userInfo = staking.getUserInfo(user);

        if (userInfo.stakedAmount == 0) {
            return;
        }

        amount = bound(amount, 1, userInfo.stakedAmount);

        vm.prank(user);
        staking.unstake(amount);
    }

    function emergencyWithdraw() external {
        if (staking.emergencyWithdrawn(user)) {
            return;
        }

        Staking.UserInfo memory userInfo = staking.getUserInfo(user);

        if (userInfo.stakedAmount == 0) {
            return;
        }

        vm.prank(user);
        staking.emergencyWithdrawal(userInfo.stakedAmount);
    }
}