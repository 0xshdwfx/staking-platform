// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Staking} from "../../src/Staking.sol";
import {StakingToken} from "../../src/StakingToken.sol";
import {RewardToken} from "../../src/RewardToken.sol";
import {StakingInvariantHandler} from "./StakingInvariantHandler.t.sol";

contract StakingInvariantTest is Test {
    StakingToken internal stakingToken;
    RewardToken internal rewardToken;
    Staking internal staking;
    StakingInvariantHandler internal handler;

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

        handler = new StakingInvariantHandler(staking, stakingToken, user);

        targetContract(address(handler));
    }

    function invariant_stakingContractIsSolvent() public view {
        uint256 stakingTokenBalance = stakingToken.balanceOf(address(staking));
        uint256 recordedTotalStaked = staking.totalStaked();

        assertGe(stakingTokenBalance, recordedTotalStaked, "staking contract balance is below recorded total staked");
    }

    function invariant_emergencyWithdrawnUserHasNoStake() public view {
        if (staking.emergencyWithdrawn(user)) {
            Staking.UserInfo memory userInfo = staking.getUserInfo(user);

            assertEq(userInfo.stakedAmount, 0, "emergency-withdrawn user still has a recorded stake");
        }
    }
}
