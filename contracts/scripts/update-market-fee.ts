import { ethers } from "hardhat";

async function main() {
  console.log("🔧 Updating Market Creation Fee...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Updating with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "BNB\n");

  // Market Factory address (update this with your deployed address)
  const MARKET_FACTORY_ADDRESS = "0x273C8Dde70897069BeC84394e235feF17e7c5E1b";
  const AI_ORACLE_ADDRESS = "0xC7FBa4a30396CC6F7fD107c165eA29E4bc62314d";

  // New market creation fee: 0.0001 BNB
  const NEW_MARKET_CREATION_FEE = ethers.parseEther("0.0001");

  console.log("Market Factory Address:", MARKET_FACTORY_ADDRESS);
  console.log("New Market Creation Fee:", ethers.formatEther(NEW_MARKET_CREATION_FEE), "BNB\n");

  // Get the Market Factory contract
  const MarketFactory = await ethers.getContractAt("PredictionMarketFactory", MARKET_FACTORY_ADDRESS);

  // Check current fee
  const currentFee = await MarketFactory.marketCreationFee();
  console.log("Current Market Creation Fee:", ethers.formatEther(currentFee), "BNB");

  // Update the configuration
  console.log("\n📝 Updating configuration...");
  const tx = await MarketFactory.updateConfig(NEW_MARKET_CREATION_FEE, AI_ORACLE_ADDRESS);
  console.log("Transaction sent:", tx.hash);
  
  console.log("⏳ Waiting for confirmation...");
  const receipt = await tx.wait();
  
  if (receipt) {
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
  }

  // Verify the new fee
  const newFee = await MarketFactory.marketCreationFee();
  console.log("\n✅ Market Creation Fee updated successfully!");
  console.log("New fee:", ethers.formatEther(newFee), "BNB");
  
  console.log("\n🎉 Update completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error updating market creation fee:");
    console.error(error);
    process.exit(1);
  });
