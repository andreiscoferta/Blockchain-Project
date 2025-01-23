// script/MintAnanas.s.sol
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {Ananas} from "../src/Ananas.sol";

contract MintAnanas is Script {
    function run() external {
        // Address of the deployed contract
        address ananasAddress = 0x9051847c9067750286Da75951aC63C9B305A9F37;
        
        // Address to mint tokens to (in this case, your deployer address)
        address toAddress = 0x07b8533CddEf46C85759A6dcF7cAA61534D5525f;
        
        // Amount of tokens to mint (1000 tokens with 18 decimals, adjust as needed)
        uint256 amount = 1000 * 10 ** 18;

        // Get the Ananas contract instance
        Ananas ananas = Ananas(ananasAddress);

        // Start broadcasting transactions
        vm.startBroadcast();

        // Mint tokens
        ananas.mint(toAddress, amount);

        // Stop broadcasting
        vm.stopBroadcast();
    }
}