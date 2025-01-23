pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {Ananas} from "../src/Ananas.sol";

contract TestBurnFunctionality is Script {
    function run() external {
        // Address of the deployed Ananas token contract
        address ananasAddress = 0x9051847c9067750286Da75951aC63C9B305A9F37;
        
        // Address from which tokens will be burned (for this example, same as admin/deployer)
        address burnFromAddress = 0x07b8533CddEf46C85759A6dcF7cAA61534D5525f;
        
        // Amount to burn
        uint256 amount = 100 * 10 ** 18;

        Ananas ananas = Ananas(ananasAddress);

        // Start broadcasting transactions
        vm.startBroadcast();

        // Burn tokens from the specified address
        ananas.burn(amount);

        // Stop broadcasting
        vm.stopBroadcast();

    }
}