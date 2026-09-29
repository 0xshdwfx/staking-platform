// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Staking} from "../../src/Staking.sol";
import {StakingToken} from "../../src/StakingToken.sol";
import {RewardToken} from "../../src/RewardToken.sol";

contract StakingInvariantTest is Test {
    StakingToken internal stakingToken;
    RewardToken internal rewardToken;
    Staking internal staking;

    address internal user = makeAddr("user");

    uint256 internal constant INITIAL_USER_BALANCE = 100 ether;

    function setUp() public {
        stakingToken = new StakingToken();
        rewardToken = new RewardToken();
        staking = new Staking(address(stakingToken), address(rewardToken));

        stakingToken.transfer(user, INITIAL_USER_BALANCE);

        vm.prank(user);
        stakingToken.approve(address(staking), type(uint256).max);

        rewardToken.transferOwnership(address(staking));
    }
}