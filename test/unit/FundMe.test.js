const {
	assert,
	expect,
} = require('chai'); /* Chai here is providing the assert keyword, but the expect is coming from hardhat-waffle. In this 
case, chai is being overwritten by hardhat - waffle to provide the expect keyword. */
const { network, deployments, ethers } = require('hardhat');
const { developmentChains } = require('../../helper-hardhat-config');

/* 
Adjustments I made to get the test to run without errors - to be shared on the repo

1. Converted ```ethers.utils.parseEther("1")``` to ```ethers.parseEther("1")``` - LINE 18 below.
2. Converted ```getContract``` to ```getContractAt``` on LINE 37 and 44 below.
3. Found more help in this discussion post: https://github.com/smartcontractkit/full-blockchain-solidity-course-js/discussions/6102 
by @parthsarthimishra - scroll to bottom(just before my own comment). 
4. All the withdraw tests failed. For the first test, I changed to "fundMe.getAddress()" from "fundMe.address" and I also changed to 
\```const startingFundMeBalance = await ethers.provider.getBalance( // replacing "fundMe.provider..." with "ethers.provider..." - it seems the last merged PR for that area pushed an error
		fundMe.getAddress(),
	);```. I found the help here: https://github.com/smartcontractkit/full-blockchain-solidity-course-js/discussions/5967
5. Changed "effectiveGasPrice" to "gasPrice" as is now being recieved on the transactionReceipt response. 
*/

!developmentChains.includes(network.name) // test should only run on a test network.
	? describe.skip
	: describe('FundMe', function () {
			let fundMe;
			let mockV3Aggregator;
			let deployer;
			const sendValue =
				ethers.parseEther(
					'1',
				); /* this parseEthers utility helps us convert our ethers to 
          wei without us doing it ourselves. */
			beforeEach(async () => {
				//   const accounts = await ethers.getSigners() // another way to get list of accounts(private-keys added in the hardhat config). This is similar to using the getNamedAccounts().
				//   deployer = accounts[0]
				// const provider = new ethers.JsonRpcProvider(process.env.RPC_URL); // not used here

				deployer = (await getNamedAccounts()).deployer; // kind of redundant
				// console.log(`deployer is : ${deployer}`); // kind of redundant too
				await deployments.fixture(['all']); // this single line deploys all our contracts - thanks to the "all" tags - see deploy scripts for tags
				const myContract = await deployments.get('FundMe');

				// fundMe = await ethers.getContract('FundMe', deployer);
				/* the above line returns error "ethers.getContract is not a function".*/

				fundMe = await ethers.getContractAt(
					myContract.abi,
					myContract.address,
				); /* this line gives us the most recent instance of the deployed FundMe 
              contract - the ability to do this is a very key importance of hardhat - deploy as it helps us keep track of our deployments. */
				//   console.log(fundMe)
				const mymockV3Aggregator =
					await deployments.get('MockV3Aggregator');
				mockV3Aggregator = await ethers.getContractAt(
					mymockV3Aggregator.abi,
					mymockV3Aggregator.address,
				);
			});

			describe('constructor', function () {
				it('sets the aggregator addresses correctly', async () => {
					const response = await fundMe.getPriceFeed();
					console.log(`fundMe getPriceFeed: ${response}`);
					const mv3A = await mockV3Aggregator;
					// console.log('mv3A:', mv3A);
					assert.equal(response, mockV3Aggregator.target);
				});
			});

			describe('fund', function () {
				// https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
				// could also do assert.fail

				/* it.only("Fails if you don't send enough ETH", async () => { // runs only this "it" 
		statement in the whole test(due to the "only" keyword at the beginning).Also excludes those in other describe blocks. */
				it("Fails if you don't send enough ETH", async () => {
					/* this below await statement should normally break our code/tests, but using the expect keyword and setting 
            up the statement like we did, makes it works as we want in the tests(this should be thanks to hardhat waffle). Go to the hardhat 
            waffle website, and search for the "revertedWith" keyword. */
					await expect(fundMe.fund()).to.be.revertedWith(
						'You need to spend more ETH!',
					);
				});
				// we could be even more precise here by making sure exactly $50 works
				// but this is good enough for now
				it('Updates the amount funded data structure', async () => {
					await fundMe.fund({ value: sendValue });
					const response =
						await fundMe.getAddressToAmountFunded(deployer);
					assert.equal(response.toString(), sendValue.toString());
				});
				it('Adds funder to array of funders', async () => {
					await fundMe.fund({ value: sendValue });
					const response = await fundMe.getFunder(0);
					assert.equal(response, deployer);
				});
			});
			describe('withdraw', function () {
				beforeEach(async () => {
					await fundMe.fund({ value: sendValue });
				});
				it('withdraws ETH from a single funder', async () => {
					// Arrange
					const startingFundMeBalance =
						await ethers.provider.getBalance(fundMe.getAddress());
					// console.log(startingFundMeBalance);
					const startingDeployerBalance =
						await ethers.provider.getBalance(deployer);

					// Act
					const transactionResponse = await fundMe.withdraw();
					const transactionReceipt = await transactionResponse.wait();

					const { gasUsed, gasPrice } = transactionReceipt;
					// console.log(transactionReceipt);
					// console.log(gasUsed, gasPrice);
					const gasCost = gasUsed * gasPrice;

					const endingFundMeBalance =
						await ethers.provider.getBalance(fundMe.getAddress());
					const endingDeployerBalance =
						await ethers.provider.getBalance(deployer);

					// Assert
					// Maybe clean up to understand the testing
					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						/* ".add()", and ".mul()" are examples of big number methods they were used in the video. But are no longer necessary. Read why 
				in this Github discussion - Read through the whole discussions page*/
						startingFundMeBalance + startingDeployerBalance,
						endingDeployerBalance + gasCost,
					);
				});
				// this test is overloaded. Ideally we'd split it into multiple tests
				// but for simplicity we left it as one
				it('is allows us to withdraw with multiple funders', async () => {
					// Arrange
					const accounts = await ethers.getSigners();
					for (i = 1; i < 6; i++) {
						const fundMeConnectedContract = await fundMe.connect(
							accounts[i],
						);
						await fundMeConnectedContract.fund({
							value: sendValue,
						});
					}
					const startingFundMeBalance =
						await ethers.provider.getBalance(fundMe.getAddress());
					const startingDeployerBalance =
						await ethers.provider.getBalance(deployer);

					// Act
					const transactionResponse = await fundMe.withdraw();
					// Let's compare gas costs :)
					// const transactionResponse = await fundMe.withdraw()
					const transactionReceipt = await transactionResponse.wait();
					const { gasUsed, gasPrice } = transactionReceipt;
					const withdrawGasCost = gasUsed * gasPrice;
					// console.log(`GasCost: ${withdrawGasCost}`);
					// console.log(`GasUsed: ${gasUsed}`);
					// console.log(`GasPrice: ${gasPrice}`);
					const endingFundMeBalance =
						await ethers.provider.getBalance(fundMe.getAddress());
					const endingDeployerBalance =
						await ethers.provider.getBalance(deployer);
					// Assert
					assert.equal(
						startingFundMeBalance + startingDeployerBalance,
						endingDeployerBalance + withdrawGasCost,
					);
					// Make a getter for storage variables
					await expect(fundMe.getFunder(0)).to.be.reverted;

					for (i = 1; i < 6; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(
								accounts[i].getAddress(),
							),
							0,
						);
					}
				});

				// testing cheaper withdraw
				it('cheaperWithdraw testing... is allows us to withdraw with multiple funders', async () => {
					// Arrange
					const accounts = await ethers.getSigners();
					for (i = 1; i < 6; i++) {
						const fundMeConnectedContract = await fundMe.connect(
							accounts[i],
						);
						await fundMeConnectedContract.fund({
							value: sendValue,
						});
					}
					const startingFundMeBalance =
						await ethers.provider.getBalance(fundMe.getAddress());
					const startingDeployerBalance =
						await ethers.provider.getBalance(deployer);

					// Act
					const transactionResponse = await fundMe.cheaperWithdraw();
					// Let's compare gas costs :)
					// const transactionResponse = await fundMe.withdraw()
					const transactionReceipt = await transactionResponse.wait();
					const { gasUsed, gasPrice } = transactionReceipt;
					const withdrawGasCost = gasUsed * gasPrice;
					// console.log(`GasCost: ${withdrawGasCost}`);
					// console.log(`GasUsed: ${gasUsed}`);
					// console.log(`GasPrice: ${gasPrice}`);
					const endingFundMeBalance =
						await ethers.provider.getBalance(fundMe.getAddress());
					const endingDeployerBalance =
						await ethers.provider.getBalance(deployer);
					// Assert
					assert.equal(
						startingFundMeBalance + startingDeployerBalance,
						endingDeployerBalance + withdrawGasCost,
					);
					// Make a getter for storage variables
					await expect(fundMe.getFunder(0)).to.be.reverted;

					for (i = 1; i < 6; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(
								accounts[i].getAddress(),
							),
							0,
						);
					}
				});

				it('Only allows the owner to withdraw', async function () {
					const accounts = await ethers.getSigners();
					const attacker = accounts[1];
					// connecting the wrong deployer account. Correct deployer account is account[0]
					const attackerConnectedContract =
						await fundMe.connect(attacker);
					await expect(
						attackerConnectedContract.withdraw(),
					).to.be.revertedWithCustomError(fundMe, 'FundMe__NotOwner');
				});
			});
		});
