import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [refereeSigner] = await ethers.getSigners();
  console.log("Referee address:", refereeSigner.address);
  const bal = await ethers.provider.getBalance(refereeSigner.address);
  console.log("Balance:", ethers.formatEther(bal), "HBAR");
  const nonce = await ethers.provider.getTransactionCount(refereeSigner.address);
  console.log("Nonce:", nonce);

  const manifestPath = path.join(__dirname, "../deployments.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  console.log("Escrow contract:", manifest.contracts.ArbiterEscrow);

  const Escrow = await ethers.getContractFactory("ArbiterEscrow");
  const escrow = Escrow.attach(manifest.contracts.ArbiterEscrow);
  const jobCount = await (escrow as any).getJobCount();
  console.log("Total jobs created so far on testnet:", jobCount.toString());

  const job1 = await (escrow as any).getJob(1);
  console.log("Job #1 status:", job1.status.toString(), "(0=CREATED, 1=DELIVERED, 2=DISPUTED, 3=RESOLVED, 4=REFUNDED)");
  console.log("Job #1 buyer:", job1.buyer);
  console.log("Job #1 seller:", job1.seller);
  console.log("Job #1 amount:", ethers.formatEther(job1.amount), "HBAR");
  console.log("Job #1 disputeReason:", job1.disputeReason);
  console.log("Job #1 auditLogUri:", job1.auditLogUri);

  const repAddress = manifest.contracts.ERC8004ReputationRegistry;
  const Rep = await ethers.getContractFactory("ERC8004ReputationRegistry");
  const registry = Rep.attach(repAddress);
  const [sellerScore, totalJobs, slashes] = await (registry as any).getReputation(job1.seller);
  console.log(`Seller reputation on testnet: ${sellerScore} pts, totalJobs: ${totalJobs}, slashes: ${slashes}`);
}

main().catch(console.error);
