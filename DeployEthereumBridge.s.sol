pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {EthereumBridge} from "../src/EthereumBridge.sol"; // Asumând că ai contractul EthereumBridge în src/

contract DeployEthereumBridge is Script {
    function run() external {
        // uint256 deployerPrivateKey = uint256(uint160(uint256(bytes32(vm.envBytes32("PRIVATE_KEY")))));
        // vm.startBroadcast(deployerPrivateKey);
        vm.startBroadcast();
        address ananasAddress = 0x9051847c9067750286Da75951aC63C9B305A9F37;        
        EthereumBridge bridge = new EthereumBridge(ananasAddress);

        vm.stopBroadcast();
    }
}