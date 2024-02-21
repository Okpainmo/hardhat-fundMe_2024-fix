const { assert } = require('chai');
const { network, ethers, getNamedAccounts } = require('hardhat');
const { developmentChains } = require('../../helper-hardhat-config');

// IMPORTANT NOTES: I made some relevant changes as initially made in the unit test file. See unit test file for more.

developmentChains.includes(network.name) // test should only run on a live network or live test-network.
	? describe.skip
	: describe('FundMe Staging Tests', function () {
			let deployer;
			let fundMe;
			const sendValue = ethers.parseEther('0.1');
			beforeEach(async () => {
				deployer = (await getNamedAccounts()).deployer;

				// fundMe = await ethers.getContract('FundMe', deployer);
				/* the above line returns error "ethers.getContract is not a function".*/

				const myContract = await deployments.get('FundMe');

				fundMe = await ethers.getContractAt(
					myContract.abi,
					myContract.address,
				);
			});

			/* IMPORTANT: for the staging test, we don't need fixtures because we're assuming that we're already on at least a testnet
        that mean we don't need the mocks as well */

			it('allows people to fund and withdraw', async function () {
				const fundTxResponse = await fundMe.fund({ value: sendValue });
				await fundTxResponse.wait(1);
				const withdrawTxResponse = await fundMe.withdraw();
				await withdrawTxResponse.wait(1);

				const endingFundMeBalance = await ethers.provider.getBalance(
					fundMe.getAddress(),
				);
				console.log(
					endingFundMeBalance.toString() +
						' should equal 0, running assert equal...',
				);
				assert.equal(endingFundMeBalance.toString(), '0');
			});
		});
