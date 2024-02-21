require('@nomicfoundation/hardhat-toolbox');
// require("@nomicfoundation/hardhat-chai-matchers");
// require("@nomiclabs/hardhat-ethers")
require('dotenv').config();
require('@nomicfoundation/hardhat-verify');
require('./tasks/block-number');
require('hardhat-gas-reporter');
require('solidity-coverage');
require('hardhat-deploy');

const sepoliaRPCURL = process.env.SEPOLIA_RPC_URL || '******'; // specifying "or" values like so can be helpful.
const privateKey = process.env.PRIVATE_KEY;
const etherscanAPIKey = process.env.ETHERSCAN_API_KEY;
const coinMarketCapAPIKey = process.env.COINMARKETCAP_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	// solidity: '0.8.8', // single version mode
	solidity: {
		compilers: [{ version: '0.8.8' }, { version: '0.6.6' }],
	},
	defaultNetwork: 'hardhat', // we actually don't need to set this - it'll be hardhat by default
	networks: {
		sepolia: {
			url: sepoliaRPCURL,
			accounts: [privateKey],
			/* more than one accounts can be added to our hardhat config like so: accounts: [privateKey, privateKey2, privateKey3]. But detecting a 
            desired private key can become a problem. To fix this, we can name the using the namedAccounts entry/object below.
            */
			chainId: 11155111,
			blockConfirmations: 6,
		},
		localhost: {
			url: 'http://localhost:8545', // or "http://127.0.0.1:8545/"
			// no need for an account - hardhat will select for us from the node that will be spurned up.
			chainId: 31337,
		},
	},
	namedAccounts: {
		deployer: {
			default: 0, // this is saying the first account on the list should be the default deployment account
			11155111: 0,
			// 11155111: 1, // this means the deployment account will be the second on the list
			31337: 0,
			// 31337: 3, // this means the deployment account will be the fourth on the list
		},
		// deployer2: { // we can even create multiple users like so(a second in this case)
		//     default: 0, // this is saying the first account on the list should be the default deployment account
		//     11155111: 2, // this means the deployment account will be the third on the list/array
		//     31337: 1, // this means the deployment account will be the second on the list/array
		// }
	},
	etherscan: {
		// Your API key for Etherscan
		/* Obtain one at https://etherscan.io/ - NOTE THAT YOU MIGHT NEED TO CONFIGURE/SET API KEYS FOR DIFFERENT 
        NETWORKS(e.g.different ones for testnet and mainnet) IN CASE ETHERSCAN GIVE DIFFERENT API KEY FOR EACH.
        SET THEM UP AS COMMENTED BELOW */
		apiKey: etherscanAPIKey,
		// apiKey: {
		//     mainnet: 'YOUR_ETHERSCAN_API_KEY',
		//     optimisticEthereum: 'YOUR_OPTIMISTIC_ETHERSCAN_API_KEY',
		//     arbitrumOne: 'YOUR_ARBISCAN_API_KEY',
		// },
	},
	sourcify: {
		// Disabled by default
		// Doesn't need an API key
		enabled: true,
	},
	gasReporter: {
		enabled: true,
		// outputFile: 'gas-report.txt', // if we don't add this, the report will be outputed into the console.
		// noColors: true, // the reason for this is because the colors can get messed up if we output it into a file. You can use this if you want your report in the console.
		currency: 'USD',
		coinmarketcap: coinMarketCapAPIKey, // we need this to work with the currency part. it makes an API call to coinmarketcap anytime we run the gas reporter(i.e. anytime we run the tests). Hence it might be important to comment this out sometimes so we save the api calls.
		// token: 'ETH', // this specifies the token with you you want to get the gas report in relation to. Prices might show zeros it's because the USD values in relation to a specified token is very small compared to the allowed decimal places.
		token: 'MATIC',
	},
};
