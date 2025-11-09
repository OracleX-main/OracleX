import { ethers } from "hardhat";

async function main() {
  console.log("🔧 Managing ORX Token Minters...");

  const tokenAddress = process.env.ORX_TOKEN_ADDRESS;
  if (!tokenAddress) {
    throw new Error("ORX_TOKEN_ADDRESS not set in .env");
  }

  const [deployer] = await ethers.getSigners();
  console.log("Managing with account:", deployer.address);

  // Get token contract
  const ORXToken = await ethers.getContractFactory("ORXToken");
  const orxToken = ORXToken.attach(tokenAddress) as any;

  console.log("ORX Token at:", tokenAddress);

  // Contracts that should have minting permissions
  const minterAddresses = {
    staking: process.env.STAKING_CONTRACT_ADDRESS || "",
    governance: process.env.GOVERNANCE_DAO_ADDRESS || "",
    ecosystem: process.env.ECOSYSTEM_REWARDS_ADDRESS || "",
  };

  console.log("\n📋 Minter Addresses to Configure:");
  console.log("├─ Staking Contract:", minterAddresses.staking || "❌ Not set");
  console.log("├─ Governance DAO:", minterAddresses.governance || "❌ Not set");
  console.log("└─ Ecosystem Rewards:", minterAddresses.ecosystem || "❌ Not set");

  // Add minters
  const mintersToAdd = Object.entries(minterAddresses).filter(([_, addr]) => addr);
  
  if (mintersToAdd.length === 0) {
    console.log("\n⚠️ No minter addresses configured. Set them in .env:");
    console.log("STAKING_CONTRACT_ADDRESS=0x...");
    console.log("GOVERNANCE_DAO_ADDRESS=0x...");
    console.log("ECOSYSTEM_REWARDS_ADDRESS=0x...");
    return;
  }

  console.log("\n🔄 Adding Minters...");
  
  for (const [name, address] of mintersToAdd) {
    try {
      // Check if already a minter
      const isMinter = await orxToken.minters(address);
      
      if (isMinter) {
        console.log(`✓ ${name}: Already a minter (${address})`);
      } else {
        const tx = await orxToken.addMinter(address);
        await tx.wait();
        console.log(`✅ ${name}: Added as minter (${address})`);
      }
    } catch (error: any) {
      console.log(`❌ ${name}: Failed -`, error.message);
    }
  }

  console.log("\n✅ Minter configuration complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
