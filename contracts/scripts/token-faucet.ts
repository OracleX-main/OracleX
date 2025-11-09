import { ethers } from "hardhat";

async function main() {
  console.log("🚰 ORX Token Faucet for Testing\n");

  const tokenAddress = process.env.ORX_TOKEN_ADDRESS;
  if (!tokenAddress) {
    throw new Error("ORX_TOKEN_ADDRESS not set in .env");
  }

  const [sender] = await ethers.getSigners();
  console.log("Sending from:", sender.address);

  // Get token contract
  const ORXToken = await ethers.getContractFactory("ORXToken");
  const orxToken = ORXToken.attach(tokenAddress) as any;

  // Get recipient address from command line or .env
  const recipientAddress = process.env.FAUCET_RECIPIENT || process.argv[2];
  
  if (!recipientAddress) {
    console.log("❌ Error: No recipient address provided");
    console.log("\nUsage:");
    console.log("  npx hardhat run scripts/token-faucet.ts --network bscTestnet 0xRecipientAddress");
    console.log("  Or set FAUCET_RECIPIENT=0x... in .env");
    return;
  }

  // Amount to send (default 100 ORX)
  const amount = process.env.FAUCET_AMOUNT || "100";
  const amountWei = ethers.parseEther(amount);

  console.log("\n📊 Transfer Details:");
  console.log("├─ From:", sender.address);
  console.log("├─ To:", recipientAddress);
  console.log("├─ Amount:", amount, "ORX");
  console.log("└─ Token:", tokenAddress);

  // Check sender balance
  const senderBalance = await orxToken.balanceOf(sender.address);
  console.log("\n💰 Sender Balance:", ethers.formatEther(senderBalance), "ORX");

  if (senderBalance < amountWei) {
    console.log("❌ Error: Insufficient balance");
    console.log(`   Need: ${amount} ORX`);
    console.log(`   Have: ${ethers.formatEther(senderBalance)} ORX`);
    return;
  }

  // Check if recipient address is valid
  if (!ethers.isAddress(recipientAddress)) {
    console.log("❌ Error: Invalid recipient address");
    return;
  }

  // Send tokens
  console.log("\n🔄 Sending tokens...");
  const tx = await orxToken.transfer(recipientAddress, amountWei);
  console.log("Transaction hash:", tx.hash);
  
  console.log("⏳ Waiting for confirmation...");
  await tx.wait();

  // Check new balances
  const recipientBalance = await orxToken.balanceOf(recipientAddress);
  const newSenderBalance = await orxToken.balanceOf(sender.address);

  console.log("\n✅ Transfer Complete!");
  console.log("\n💰 Updated Balances:");
  console.log("├─ Sender:", ethers.formatEther(newSenderBalance), "ORX");
  console.log("└─ Recipient:", ethers.formatEther(recipientBalance), "ORX");

  console.log("\n🔗 View on BSCScan:");
  console.log(`https://testnet.bscscan.com/tx/${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
