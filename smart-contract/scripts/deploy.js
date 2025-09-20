const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SnakeGame contract to Shardeum...");

  // Get the contract factory
  const SnakeGame = await ethers.getContractFactory("SnakeGame");

  // Unlock time set (current time + 60 sec for testing)
  const unlockTime = Math.floor(Date.now() / 1000) + 60;

  // Deploy the contract with constructor arg
  const snakeGame = await SnakeGame.deploy(unlockTime);

  // Wait for deployment to complete
  await snakeGame.deployed();

  console.log("SnakeGame contract deployed to:", snakeGame.address);
  console.log("Unlock time:", unlockTime);

  // Verify deployment
  console.log("Contract owner:", await snakeGame.owner());

  // Save deployment info
  const deploymentInfo = {
    contractAddress: snakeGame.address,
    network: "Shardeum Liberty 1.X",
    chainId: 8080,
    deployedAt: new Date().toISOString(),
    deployer: (await ethers.getSigners())[0].address,
    unlockTime: unlockTime
  };

  console.log("\n=== DEPLOYMENT INFO ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("\n=== COPY THIS ADDRESS FOR FRONTEND ===");
  console.log(snakeGame.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
