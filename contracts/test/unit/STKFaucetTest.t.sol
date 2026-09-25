// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {STKFaucet} from "../../src/STKFaucet.sol";
import {StakingToken} from "../../src/StakingToken.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract STKFaucetTest is Test {
    STKFaucet public faucet;
    StakingToken public stakingToken;

    address public owner = makeAddr("owner");
    address public user = makeAddr("user");
    address public secondUser = makeAddr("secondUser");

    uint256 public constant CLAIM_AMOUNT = 10e18;
    uint256 public constant FUNDING_AMOUNT = 100e18;

    event TokensClaimed(address indexed user, uint256 amount);
    event FaucetFunded(address indexed funder, uint256 amount);

    function setUp() public {
        vm.prank(owner);
        stakingToken = new StakingToken();

        vm.prank(owner);
        faucet = new STKFaucet(address(stakingToken), CLAIM_AMOUNT);

        vm.prank(owner);
        bool fundingTransferSucceeded = stakingToken.transfer(address(faucet), FUNDING_AMOUNT);
        assertTrue(fundingTransferSucceeded);
    }

    function testClaimTransfersFixedAmountOnce() public {
        vm.expectEmit(true, false, false, true, address(faucet));
        emit TokensClaimed(user, CLAIM_AMOUNT);

        vm.prank(user);
        faucet.claim();

        assertEq(stakingToken.balanceOf(user), CLAIM_AMOUNT);
        assertTrue(faucet.hasClaimed(user));
    }

    function testClaimRevertsIfUserAlreadyClaimed() public {
        vm.startPrank(user);
        faucet.claim();

        vm.expectRevert(STKFaucet.STKFaucet__AlreadyClaimed.selector);
        faucet.claim();
        vm.stopPrank();
    }

    function testClaimRevertsWhenFaucetBalanceIsInsufficient() public {
        vm.prank(owner);
        STKFaucet insufficientFaucet = new STKFaucet(address(stakingToken), CLAIM_AMOUNT);

        vm.prank(owner);
        bool insufficientTransferSucceeded = stakingToken.transfer(address(insufficientFaucet), CLAIM_AMOUNT - 1);
        assertTrue(insufficientTransferSucceeded);

        vm.prank(user);
        vm.expectRevert(STKFaucet.STKFaucet__InsufficientFaucetBalance.selector);
        insufficientFaucet.claim();
    }

    function testOwnerCanFundFaucet() public {
        vm.prank(owner);
        stakingToken.approve(address(faucet), FUNDING_AMOUNT);

        vm.expectEmit(true, false, false, true, address(faucet));
        emit FaucetFunded(owner, FUNDING_AMOUNT);

        vm.prank(owner);
        faucet.fund(FUNDING_AMOUNT);

        assertEq(stakingToken.balanceOf(address(faucet)), FUNDING_AMOUNT * 2);
    }

    function testFundRevertsIfAmountIsZero() public {
        vm.prank(owner);
        vm.expectRevert(STKFaucet.STKFaucet__InvalidClaimAmount.selector);
        faucet.fund(0);
    }

    function testNonOwnerCannotFundFaucet() public {
        vm.prank(user);
        stakingToken.approve(address(faucet), CLAIM_AMOUNT);

        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, user));
        faucet.fund(CLAIM_AMOUNT);
    }

    function testConstructorRejectsZeroTokenAddress() public {
        vm.expectRevert(STKFaucet.STKFaucet__InvalidTokenAddress.selector);
        new STKFaucet(address(0), CLAIM_AMOUNT);
    }

    function testConstructorRejectsZeroClaimAmount() public {
        vm.expectRevert(STKFaucet.STKFaucet__InvalidClaimAmount.selector);
        new STKFaucet(address(stakingToken), 0);
    }

    function testDifferentUsersCanClaimOnce() public {
        vm.prank(user);
        faucet.claim();

        vm.prank(secondUser);
        faucet.claim();

        assertEq(stakingToken.balanceOf(user), CLAIM_AMOUNT);
        assertEq(stakingToken.balanceOf(secondUser), CLAIM_AMOUNT);
    }
}
