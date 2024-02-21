const { ethers, getNamedAccounts } = require('hardhat');

async function main() {
	const { deployer } = await getNamedAccounts();
	console.log(`deployer: ${deployer}`);

	// const fundMe = await ethers.getContractAt('FundMe', deployer);
	/* this above line is wrong - it returns the deployer address as the
  contract address the below implementation works fine */

	let fundMe;
	const myContract = await deployments.get('FundMe');
	fundMe = await ethers.getContractAt(myContract.abi, myContract.address);

	const fundMeAddress = await fundMe.getAddress();
	console.log(`Got contract FundMe at ${fundMeAddress}`);

	console.log('Withdrawing from contract...');
	const transactionResponse = await fundMe.withdraw();
	await transactionResponse.wait();
	console.log('Got all our deposits back!');

	const contractBalance = await ethers.provider.getBalance(fundMeAddress);
	const newFunderBalance = await ethers.provider.getBalance(deployer);

	console.log(`Funder Balance: ${newFunderBalance}`); // local nodes(the localhost) seems to use same address as deployer and contract address.
	console.log(`FundMe Balance: ${contractBalance}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
