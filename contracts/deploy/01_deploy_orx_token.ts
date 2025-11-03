import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "ethers";

const deployORXToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const initialSupply = process.env.INITIAL_SUPPLY || "1000000000"; // 1 billion tokens
  const tokenName = process.env.TOKEN_NAME || "OracleX Token";
  const tokenSymbol = process.env.TOKEN_SYMBOL || "ORX";

  console.log("Deploying ORX Token...");
  console.log("Deployer:", deployer);
  console.log("Initial Supply:", initialSupply);
  console.log("Token Name:", tokenName);
  console.log("Token Symbol:", tokenSymbol);

  const orxToken = await deploy("ORXToken", {
    from: deployer,
    args: [
      tokenName,
      tokenSymbol,
      ethers.parseEther(initialSupply), // Convert to wei
      deployer // Initial owner
    ],
    log: true,
    waitConfirmations: 1,
  });

  console.log(`ORX Token deployed to: ${orxToken.address}`);
  console.log(`Transaction hash: ${orxToken.transactionHash}`);

  // Verify contract if on testnet/mainnet
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    
    try {
      await hre.run("verify:verify", {
        address: orxToken.address,
        constructorArguments: [
          tokenName,
          tokenSymbol,
          ethers.parseEther(initialSupply),
          deployer
        ],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }

  return true;
};

export default deployORXToken;
deployORXToken.tags = ["ORXToken", "token"];
deployORXToken.id = "deploy_orx_token";