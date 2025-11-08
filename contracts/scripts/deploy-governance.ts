import { ethers } from "hardhat";

async function main() {
  console.log("Deploying GovernanceDAO contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get deployed contract addresses from environment or previous deployments
  const ORX_TOKEN_ADDRESS = process.env.ORX_TOKEN_ADDRESS || "";
  const STAKING_CONTRACT_ADDRESS = process.env.STAKING_CONTRACT_ADDRESS || "";

  if (!ORX_TOKEN_ADDRESS || !STAKING_CONTRACT_ADDRESS) {
    throw new Error("ORX_TOKEN_ADDRESS and STAKING_CONTRACT_ADDRESS must be set in environment");
  }

  console.log("ORX Token Address:", ORX_TOKEN_ADDRESS);
  console.log("Staking Contract Address:", STAKING_CONTRACT_ADDRESS);

  // Governance parameters
  const PROPOSAL_THRESHOLD = ethers.parseEther("10000"); // 10,000 ORX to create proposal
  const VOTING_DELAY = 24 * 60 * 60; // 24 hours
  const VOTING_PERIOD = 7 * 24 * 60 * 60; // 7 days
  const QUORUM_PERCENTAGE = 10; // 10% of total supply
  const APPROVAL_PERCENTAGE = 60; // 60% approval needed

  // Deploy GovernanceDAO
  const GovernanceDAO = await ethers.getContractFactory("GovernanceDAO");
  const governanceDAO = await GovernanceDAO.deploy(
    ORX_TOKEN_ADDRESS,
    STAKING_CONTRACT_ADDRESS,
    PROPOSAL_THRESHOLD,
    VOTING_DELAY,
    VOTING_PERIOD,
    QUORUM_PERCENTAGE,
    APPROVAL_PERCENTAGE
  );

  await governanceDAO.waitForDeployment();
  const governanceAddress = await governanceDAO.getAddress();

  console.log("✅ GovernanceDAO deployed to:", governanceAddress);
  console.log("\nDeployment Summary:");
  console.log("==================");
  console.log("GovernanceDAO:", governanceAddress);
  console.log("ORX Token:", ORX_TOKEN_ADDRESS);
  console.log("Staking Contract:", STAKING_CONTRACT_ADDRESS);
  console.log("\nGovernance Parameters:");
  console.log("Proposal Threshold:", ethers.formatEther(PROPOSAL_THRESHOLD), "ORX");
  console.log("Voting Delay:", VOTING_DELAY / 3600, "hours");
  console.log("Voting Period:", VOTING_PERIOD / (24 * 3600), "days");
  console.log("Quorum:", QUORUM_PERCENTAGE, "%");
  console.log("Approval Threshold:", APPROVAL_PERCENTAGE, "%");
  console.log("\n📝 Add to your .env file:");
  console.log(`GOVERNANCE_CONTRACT_ADDRESS=${governanceAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
