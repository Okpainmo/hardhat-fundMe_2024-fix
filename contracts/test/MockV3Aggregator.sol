// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol";


/* SOME TRICKY STUFFS HAPPENING HERE: While trying to deploy a mock AggregatorV3 contract, we checked into the chainlink repo and found 
their own mock on github(https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.6/tests/MockV3Aggregator.sol). So 
instead of copying code, we decided to link to it since we have the code inside of our node_modules folder.

Here is a path to the node_modules folder: C:\Master\code-stuffs\code-adventures\my-blockchain-adventures\practice-contracts_all-projects\local-development-projects\hardhat-fundMe\node_modules\@chainlink\contracts\src\v0.6\tests\MockV3Aggregator.sol

Simply look our for the constructor in the SC, and check for it's arguments
*/