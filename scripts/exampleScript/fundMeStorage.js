const { ethers, getNamedAccounts } = require('hardhat');

async function main() {
	const { deployer } = await getNamedAccounts();
	console.log(`deployer: ${deployer}`);
	// const fundMe = await ethers.getContractAt('FundMe', deployer);
	/* this above line is wrong - it returns the deployer address as the
  contract address the below implementation works fine */

	let fundMe;
	let mockV3Aggregator;

	const myfundMeContract = await deployments.get('FundMe');
	fundMe = await ethers.getContractAt(
		myfundMeContract.abi,
		myfundMeContract.address,
	);

	const fundMeAddress = await fundMe.getAddress();
	console.log(`Got contract FundMe at ${fundMeAddress}`);

	const myV3Contract = await deployments.get('MockV3Aggregator');
	mockV3Aggregator = await ethers.getContractAt(
		myV3Contract.abi,
		myV3Contract.address,
	);

	const mV3Address = await mockV3Aggregator.getAddress();
	console.log(`Got contract MockV3Aggregator at ${mV3Address}`);

	// changed "getStorageAt" to "getStorage" and "address" to "getAddress()" for ethers v6.
	let response = await ethers.provider.getStorage(fundMe.getAddress(), 0);
	console.log(response);
	response = await ethers.provider.getStorage(fundMe.getAddress(), 1);
	console.log(response);
	response = await ethers.provider.getStorage(fundMe.getAddress(), 2);
	console.log(response);
	response = await ethers.provider.getStorage(fundMe.getAddress(), 3);
	console.log(response);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
