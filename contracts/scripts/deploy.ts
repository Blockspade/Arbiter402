import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("==================================================");
  console.log("🚀 Deploying Arbiter402 Protocol to:", network.name);
  console.log("Deployer / Referee Address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer Balance:", ethers.formatEther(balance), "HBAR / ETH");
  console.log("==================================================");

  // 1. Deploy ERC8004ReputationRegistry
  console.log("\n📦 Step 1: Deploying ERC8004ReputationRegistry...");
  const RegistryFactory = await ethers.getContractFactory("ERC8004ReputationRegistry");
  const registry = await RegistryFactory.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("✅ ERC8004ReputationRegistry deployed at:", registryAddress);

  // 2. Deploy ArbiterEscrow
  console.log("\n📦 Step 2: Deploying ArbiterEscrow...");
  const EscrowFactory = await ethers.getContractFactory("ArbiterEscrow");
  const refereeAddress = deployer.address;
  const escrow = await EscrowFactory.deploy(refereeAddress, registryAddress);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("✅ ArbiterEscrow deployed at:", escrowAddress);

  // 3. Authorize ArbiterEscrow on the Reputation Registry
  console.log("\n🔐 Step 3: Authorizing ArbiterEscrow as official reporter in Registry...");
  const authTx = await registry.setAuthorizedReporter(escrowAddress, true);
  await authTx.wait();
  console.log("✅ ArbiterEscrow authorized!");

  // 4. Save Deployment Manifest
  const deploymentManifest = {
    network: network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
    contracts: {
      ERC8004ReputationRegistry: registryAddress,
      ArbiterEscrow: escrowAddress,
      Referee: refereeAddress,
    },
  };

  const manifestPath = path.join(__dirname, "../deployments.json");
  fs.writeFileSync(manifestPath, JSON.stringify(deploymentManifest, null, 2));
  console.log("\n💾 Deployment manifest saved to:", manifestPath);
  console.log("==================================================");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
