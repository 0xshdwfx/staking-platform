// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {STKFaucet} from "../src/STKFaucet.sol";
import {console} from "forge-std/console.sol";

contract DeploySTKFaucetScript is Script {
    address public constant STAKING_TOKEN =
        0xd0Db12859F3200e7b947b823F10dc7A460328C03;

    uint256 public constant CLAIM_AMOUNT = 10e18;

    function run() external returns (STKFaucet faucet) {
        vm.startBroadcast();

        faucet = new STKFaucet(STAKING_TOKEN, CLAIM_AMOUNT);

        vm.stopBroadcast();

        console.log("STKFaucet deployed at:", address(faucet));
        console.log("StakingToken configured as:", STAKING_TOKEN);
        console.log("Claim amount:", CLAIM_AMOUNT);
    }
}