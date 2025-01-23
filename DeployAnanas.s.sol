pragma solidity ^0.8.0;
import {Script} from "forge-std/Script.sol";
import {Ananas} from "../src/Ananas.sol";

contract DeployAnanas is Script {
    function run() external {
        vm.startBroadcast();
        Ananas ananas = new Ananas();
        vm.stopBroadcast();
    }
}