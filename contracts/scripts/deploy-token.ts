import { ethers } from "hardhat";

async function main() {
  console.log("🪙 Deploying ORX Token...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

  // Wallet addresses for token distribution
  // IMPORTANT: Update these addresses before deployment
  const walletAddresses = {
    team: process.env.TEAM_WALLET || deployer.address,
    investors: process.env.INVESTORS_WALLET || deployer.address,
    ecosystem: process.env.ECOSYSTEM_WALLET || deployer.address,
    treasury: process.env.TREASURY_WALLET || deployer.address,
    liquidity: process.env.LIQUIDITY_WALLET || deployer.address,
  };

  console.log("\n📊 Token Distribution Addresses:");
  console.log("├─ Team (15%):", walletAddresses.team);
  console.log("├─ Investors (20%):", walletAddresses.investors);
  console.log("├─ Ecosystem (40%):", walletAddresses.ecosystem);
  console.log("├─ Treasury (15%):", walletAddresses.treasury);
  console.log("└─ Liquidity (10%):", walletAddresses.liquidity);

  // Deploy ORX Token
  const ORXToken = await ethers.getContractFactory("ORXToken");
  const orxToken = await ORXToken.deploy(
    walletAddresses.team,
    walletAddresses.investors,
    walletAddresses.ecosystem,
    walletAddresses.treasury,
    walletAddresses.liquidity
  );

  await orxToken.waitForDeployment();
  const tokenAddress = await orxToken.getAddress();

  console.log("\n✅ ORX Token deployed to:", tokenAddress);

  // Verify token details
  const name = await orxToken.name();
  const symbol = await orxToken.symbol();
  const totalSupply = await orxToken.totalSupply();
  const decimals = await orxToken.decimals();

  console.log("\n📋 Token Details:");
  console.log("├─ Name:", name);
  console.log("├─ Symbol:", symbol);
  console.log("├─ Decimals:", decimals);
  console.log("└─ Total Supply:", ethers.formatEther(totalSupply), symbol);

  // Check balances
  console.log("\n💰 Token Balances:");
  const teamBalance = await orxToken.balanceOf(walletAddresses.team);
  const investorsBalance = await orxToken.balanceOf(walletAddresses.investors);
  const ecosystemBalance = await orxToken.balanceOf(walletAddresses.ecosystem);
  const treasuryBalance = await orxToken.balanceOf(walletAddresses.treasury);
  const liquidityBalance = await orxToken.balanceOf(walletAddresses.liquidity);

  console.log("├─ Team:", ethers.formatEther(teamBalance), symbol);
  console.log("├─ Investors:", ethers.formatEther(investorsBalance), symbol);
  console.log("├─ Ecosystem:", ethers.formatEther(ecosystemBalance), symbol);
  console.log("├─ Treasury:", ethers.formatEther(treasuryBalance), symbol);
  console.log("└─ Liquidity:", ethers.formatEther(liquidityBalance), symbol);

  console.log("\n🔍 Add this to your .env file:");
  console.log(`ORX_TOKEN_ADDRESS="${tokenAddress}"`);

  console.log("\n📝 Next Steps:");
  console.log("1. Update .env with the token address above");
  console.log("2. Verify contract on BSCScan:");
  console.log(`   npx hardhat verify --network bscTestnet ${tokenAddress} "${walletAddresses.team}" "${walletAddresses.investors}" "${walletAddresses.ecosystem}" "${walletAddresses.treasury}" "${walletAddresses.liquidity}"`);
  console.log("3. Add token to MetaMask using address:", tokenAddress);
  console.log("4. Add minter roles for Staking and Governance contracts");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: "BSC Testnet",
    chainId: 97,
    tokenAddress: tokenAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    tokenDetails: {
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: ethers.formatEther(totalSupply)
    },
    walletAddresses,
    verifyCommand: `npx hardhat verify --network bscTestnet ${tokenAddress} "${walletAddresses.team}" "${walletAddresses.investors}" "${walletAddresses.ecosystem}" "${walletAddresses.treasury}" "${walletAddresses.liquidity}"`
  };

  fs.writeFileSync(
    'deployments/orx-token-deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n💾 Deployment info saved to: deployments/orx-token-deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
