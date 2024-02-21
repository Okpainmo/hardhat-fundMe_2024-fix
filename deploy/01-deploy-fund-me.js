const { network } = require('hardhat');
const {
	networkConfig,
	developmentChains,
} = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');
require('dotenv').config();

// creating a hardhat node(```npx hardhat node```) will also run hardhat deploy, and deploy all the contracts on the node.

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const chainId = network.config.chainId; // remember that we'll be specifying the network we want on the CLI. So the network will he detected there.

	let ethUsdPriceFeedAddress;
	if (chainId == 31337) {
		const ethUsdAggregator = await deployments.get('MockV3Aggregator');
		ethUsdPriceFeedAddress = ethUsdAggregator.address;
	} else {
		ethUsdPriceFeedAddress = networkConfig[chainId]['ethUsdPriceFeed'];
	}
	log('----------------------------------------------------');
	log('Deploying FundMe and waiting for confirmations...');
	const fundMe = await deploy('FundMe', {
		from: deployer,
		args: [ethUsdPriceFeedAddress],
		log: true,
		// gasPrice: 100000000000 // learn if this works in hardhat deploy. It works in ethers - see your own deploy script of the ethers simple storage chapter.

		// we need to wait if on a live network so we can verify properly - we specified the number of blocks in the hardhat config file
		waitConfirmations: network.config.blockConfirmations || 1, // check hardhat config for the number of blocks to wait, or just use 1 as the number of blocks to wait.
	});
	log(`FundMe deployed at ${fundMe.address}`);

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		await verify(fundMe.address, [ethUsdPriceFeedAddress]);
	}
};

module.exports.tags = ['all', 'fundme'];
