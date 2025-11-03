import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployOracleBridge: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying Oracle Bridge...");
  console.log("Deployer:", deployer);

  // Get the deployed ORX Token address
  const orxToken = await get("ORXToken");
  console.log("ORX Token address:", orxToken.address);

  const oracleBridge = await deploy("OracleBridge", {
    from: deployer,
    args: [
      orxToken.address, // ORX Token address
      deployer // Initial owner
    ],
    log: true,
    waitConfirmations: 1,
  });

  console.log(`Oracle Bridge deployed to: ${oracleBridge.address}`);
  console.log(`Transaction hash: ${oracleBridge.transactionHash}`);

  // Verify contract if on testnet/mainnet
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    
    try {
      await hre.run("verify:verify", {
        address: oracleBridge.address,
        constructorArguments: [
          orxToken.address,
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

export default deployOracleBridge;
deployOracleBridge.tags = ["OracleBridge", "oracle"];
deployOracleBridge.dependencies = ["ORXToken"]; // Deploy after ORX Token
deployOracleBridge.id = "deploy_oracle_bridge";