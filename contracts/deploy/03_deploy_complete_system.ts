import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("🚀 Starting OracleX deployment to BNB Smart Chain Testnet...\n");
  console.log("Deploying contracts with account:", deployer);

  const deployerSigner = await ethers.getSigner(deployer);
  const balance = await ethers.provider.getBalance(deployer);
  console.log("Account balance:", ethers.formatEther(balance), "BNB\n");

  // Deployment parameters
  const TOTAL_SUPPLY = ethers.parseEther("1000000000"); // 1 billion ORX
  const MARKET_CREATION_FEE = ethers.parseEther("0.01"); // 0.01 BNB
  const MINIMUM_CONFIDENCE = 70; // 70% minimum confidence
  const MINIMUM_AGENTS = 3; // Minimum 3 AI agents
  const CONSENSUS_THRESHOLD = 60; // 60% consensus threshold
  const REWARD_RATE = ethers.parseEther("0.0001"); // Reward rate per second
  const MINIMUM_VALIDATOR_STAKE = ethers.parseEther("10000"); // 10,000 ORX
  const MINIMUM_STAKING_PERIOD = 7 * 24 * 60 * 60; // 7 days
  const SLASHING_RATE = 1000; // 10% slashing rate (basis points)
  const MINIMUM_DISPUTE_BOND = ethers.parseEther("0.1"); // 0.1 BNB
  const VOTING_PERIOD = 3 * 24 * 60 * 60; // 3 days
  const QUORUM_THRESHOLD = 30; // 30% quorum

  // 1. Deploy ORX Token
  console.log("📄 Deploying ORX Token...");
  const orxToken = await deploy("ORXToken", {
    from: deployer,
    args: [
      deployer, // team wallet
      deployer, // investors wallet  
      deployer, // ecosystem wallet
      deployer, // treasury wallet
      deployer, // liquidity wallet
    ],
    log: true,
    deterministicDeployment: false,
  });
  console.log("✅ ORX Token deployed to:", orxToken.address);

  // 2. Deploy AI Oracle
  console.log("\n🤖 Deploying AI Oracle...");
  const aiOracle = await deploy("AIOracle", {
    from: deployer,
    args: [MINIMUM_CONFIDENCE, MINIMUM_AGENTS, CONSENSUS_THRESHOLD],
    log: true,
    deterministicDeployment: false,
  });
  console.log("✅ AI Oracle deployed to:", aiOracle.address);

  // 3. Deploy Staking Contract
  console.log("\n🏦 Deploying Staking Contract...");
  const stakingContract = await deploy("StakingContract", {
    from: deployer,
    args: [
      orxToken.address,
      REWARD_RATE,
      MINIMUM_VALIDATOR_STAKE,
      MINIMUM_STAKING_PERIOD,
      SLASHING_RATE,
    ],
    log: true,
    deterministicDeployment: false,
  });
  console.log("✅ Staking Contract deployed to:", stakingContract.address);

  // 4. Deploy Dispute Resolution
  console.log("\n⚖️ Deploying Dispute Resolution...");
  const disputeResolution = await deploy("DisputeResolution", {
    from: deployer,
    args: [
      orxToken.address,
      stakingContract.address,
      MINIMUM_DISPUTE_BOND,
      VOTING_PERIOD,
      QUORUM_THRESHOLD,
    ],
    log: true,
    deterministicDeployment: false,
  });
  console.log("✅ Dispute Resolution deployed to:", disputeResolution.address);

  // 5. Deploy Prediction Market Factory
  console.log("\n🏭 Deploying Prediction Market Factory...");
  const marketFactory = await deploy("PredictionMarketFactory", {
    from: deployer,
    args: [MARKET_CREATION_FEE, aiOracle.address],
    log: true,
    deterministicDeployment: false,
  });
  console.log("✅ Prediction Market Factory deployed to:", marketFactory.address);

  // 6. Deploy Oracle Bridge (original contract)
  console.log("\n🌉 Deploying Oracle Bridge...");
  const oracleBridge = await deploy("OracleBridge", {
    from: deployer,
    args: [orxToken.address],
    log: true,
    deterministicDeployment: false,
  });
  console.log("✅ Oracle Bridge deployed to:", oracleBridge.address);

  // 7. Set up initial configurations
  console.log("\n⚙️ Setting up initial configurations...");

  // Get contract instances
  const orxTokenContract = await ethers.getContractAt("ORXToken", orxToken.address);
  const aiOracleContract = await ethers.getContractAt("AIOracle", aiOracle.address);
  const stakingContractInstance = await ethers.getContractAt("StakingContract", stakingContract.address);
  const marketFactoryContract = await ethers.getContractAt("PredictionMarketFactory", marketFactory.address);

  // Set staking contract in market factory
  await marketFactoryContract.setStakingContract(stakingContract.address);
  console.log("✅ Staking contract set in Market Factory");

  // Authorize deployer as initial AI agent
  await aiOracleContract.authorizeAgent(deployer, 1000); // Max reputation
  console.log("✅ Deployer authorized as AI agent");

  // Transfer some ORX tokens to staking contract for rewards
  const rewardAmount = ethers.parseEther("1000000"); // 1M ORX for rewards
  await orxTokenContract.transfer(stakingContract.address, rewardAmount);
  console.log("✅ Reward tokens transferred to staking contract");

  // 8. Create a test market for demonstration
  console.log("\n🏪 Creating test market...");
  const testMarketTx = await marketFactoryContract.createMarket(
    "Will Bitcoin reach $100,000 by end of 2025?",
    "A prediction market about Bitcoin's price reaching $100,000 USD by December 31, 2025",
    ["Yes", "No"],
    Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
    "Cryptocurrency",
    0, // AI Oracle type
    { value: MARKET_CREATION_FEE }
  );
  await testMarketTx.wait();
  console.log("✅ Test market created successfully");

  // Final summary
  console.log("\n🎉 Deployment completed successfully!");
  console.log("=====================================");
  console.log("Contract Addresses:");
  console.log("=====================================");
  console.log("ORX Token:", orxToken.address);
  console.log("AI Oracle:", aiOracle.address);
  console.log("Staking Contract:", stakingContract.address);
  console.log("Dispute Resolution:", disputeResolution.address);
  console.log("Market Factory:", marketFactory.address);
  console.log("Oracle Bridge:", oracleBridge.address);
  console.log("=====================================");
  console.log("Network: BNB Smart Chain Testnet");
  console.log("Deployer:", deployer);
  console.log("=====================================");

  // Save deployment info to file
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer,
    timestamp: new Date().toISOString(),
    contracts: {
      ORXToken: orxToken.address,
      AIOracle: aiOracle.address,
      StakingContract: stakingContract.address,
      DisputeResolution: disputeResolution.address,
      PredictionMarketFactory: marketFactory.address,
      OracleBridge: oracleBridge.address,
    },
    parameters: {
      totalSupply: TOTAL_SUPPLY.toString(),
      marketCreationFee: MARKET_CREATION_FEE.toString(),
      minimumConfidence: MINIMUM_CONFIDENCE,
      minimumAgents: MINIMUM_AGENTS,
      consensusThreshold: CONSENSUS_THRESHOLD,
      rewardRate: REWARD_RATE.toString(),
      minimumValidatorStake: MINIMUM_VALIDATOR_STAKE.toString(),
      minimumStakingPeriod: MINIMUM_STAKING_PERIOD,
      slashingRate: SLASHING_RATE,
      minimumDisputeBond: MINIMUM_DISPUTE_BOND.toString(),
      votingPeriod: VOTING_PERIOD,
      quorumThreshold: QUORUM_THRESHOLD,
    },
  };

  const fs = require("fs");
  fs.writeFileSync("deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to deployment-info.json");
};

export default deployContracts;
deployContracts.tags = ["OracleX"];