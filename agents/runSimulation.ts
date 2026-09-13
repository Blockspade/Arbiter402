import { ethers } from "hardhat";
import { BuyerAgent } from "./buyerAgent";
import { SellerAgent } from "./sellerAgent";
import { RefereeService } from "../referee/refereeService";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("\n");
  console.log("=======================================================================");
  console.log("⚖️   ARBITER402: AUTONOMOUS MACHINE-TO-MACHINE COMMERCE SHOWDOWN");
  console.log("     Hedera EVM + The Graph Ground-Truth + Bazantic MCP + ERC-8004");
  console.log("=======================================================================\n");

  const [deployer, buyerSigner, sellerSigner] = await ethers.getSigners();
  const refereeSigner = deployer;

  // 1. Deploy Clean Contracts for Simulation
  console.log("📦 Deploying Protocol Contracts on Local Hedera EVM Node...");
  const RegistryFactory = await ethers.getContractFactory("ERC8004ReputationRegistry");
  const registry = (await RegistryFactory.deploy()) as any;
  await registry.waitForDeployment();

  const EscrowFactory = await ethers.getContractFactory("ArbiterEscrow");
  const escrow = (await EscrowFactory.deploy(
    refereeSigner.address,
    await registry.getAddress()
  )) as any;
  await escrow.waitForDeployment();
  await (await registry.setAuthorizedReporter(await escrow.getAddress(), true)).wait();

  const escrowAddress = await escrow.getAddress();
  const registryAddress = await registry.getAddress();
  console.log(`✅ ArbiterEscrow: ${escrowAddress}`);
  console.log(`✅ ERC-8004 Registry: ${registryAddress}\n`);

  // Initialize Agents & Referee
  const buyer = new BuyerAgent(buyerSigner, escrow);
  const honestSeller = new SellerAgent(sellerSigner, escrow, "honest");
  const rogueSeller = new SellerAgent(sellerSigner, escrow, "rogue");
  const refereeService = new RefereeService(escrowAddress, refereeSigner.address);

  // =========================================================================
  // SCENARIO 1: HONEST AGENT FLOW (Happy Path)
  // =========================================================================
  console.log("-----------------------------------------------------------------------");
  console.log("🟢 SCENARIO 1: HONEST MACHINE COMMERCE (Sub-Second Settlement)");
  console.log("-----------------------------------------------------------------------");

  const [rep1Score] = await registry.getReputation(sellerSigner.address);
  console.log(`📊 Initial Seller ERC-8004 Trust Score: ${rep1Score} pts`);

  // Step 1: Buyer locks escrow
  const spec1 = buyer.createJobSpec(1);
  const jobId1 = await buyer.lockEscrow(sellerSigner.address, spec1, "0.5");
  await sleep(300);

  // Step 2: Honest Seller computes and submits deliverable
  const deliverable1 = await honestSeller.computeDeliverable(jobId1);
  await honestSeller.submit(jobId1, deliverable1);
  await sleep(300);

  // Step 3: Buyer confirms
  await buyer.confirm(jobId1);

  // Verify updated score
  const [rep1ScoreAfter, totalJobs1, slashes1] = await registry.getReputation(sellerSigner.address);
  console.log(`\n🎉 Round 1 Complete!`);
  console.log(`   • Seller Reputation: ${rep1Score} ──> ${rep1ScoreAfter} (+5 pts)`);
  console.log(`   • Completed Jobs: ${totalJobs1} | Slashes: ${slashes1}`);
  console.log(`   • Payment: 0.5 HBAR Settled to Seller`);

  // =========================================================================
  // SCENARIO 2: ROGUE / HALLUCINATED AGENT FLOW (Dispute & Ground-Truth Slash)
  // =========================================================================
  console.log("\n-----------------------------------------------------------------------");
  console.log("🔴 SCENARIO 2: ROGUE AGENT ADJUDICATION (The Graph Oracle & Slashing)");
  console.log("-----------------------------------------------------------------------");

  // Step 1: Buyer locks escrow for Job #2
  const spec2 = buyer.createJobSpec(2);
  const jobId2 = await buyer.lockEscrow(sellerSigner.address, spec2, "0.5");
  await sleep(300);

  // Step 2: Rogue Seller submits hallucinated deliverable (+19.5% variance)
  const deliverable2 = await rogueSeller.computeDeliverable(jobId2);
  await rogueSeller.submit(jobId2, deliverable2);
  await sleep(300);

  // Step 3: Buyer detects variance and raises dispute
  await buyer.dispute(jobId2, "Deliverable deviates by +19.5% from expected index parameters");
  await sleep(300);

  // Step 4: Referee Service adjudicates via The Graph and Hedera HCS
  const adjudicationOutcome = await refereeService.processDispute(
    spec2,
    deliverable2,
    refereeSigner
  );

  // Verify updated scores and refund
  const [rep2ScoreAfter, totalJobs2, slashes2] = await registry.getReputation(sellerSigner.address);

  console.log("=======================================================================");
  console.log("🏆 FINAL SIMULATION AUDIT SUMMARY");
  console.log("=======================================================================");
  console.log(`💼 Seller Final Trust Score : ${rep2ScoreAfter} pts (Slashed from ${rep1ScoreAfter})`);
  console.log(`⚠️ Total Slashes Recorded   : ${slashes2}`);
  console.log(`🛡️ Buyer Protection Status   : 100% REFUNDED (0.5 HBAR returned)`);
  console.log(`🏛️ The Graph Ground Truth    : $${adjudicationOutcome.adjudication.groundTruthValue}`);
  console.log(`📊 Rogue Seller Output      : $${adjudicationOutcome.adjudication.sellerValue} (+${adjudicationOutcome.adjudication.deltaPercent}% Error)`);
  console.log(`⛓️ Hedera HCS Topic Proof   : Seq #${adjudicationOutcome.hcsProof.sequenceNumber} (${adjudicationOutcome.hcsProof.consensusTimestamp})`);
  console.log(`🔍 Hedera HashScan Explorer  : ${adjudicationOutcome.hcsProof.hashscanUrl}`);
  console.log("=======================================================================\n");
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Simulation failed:", err);
      process.exit(1);
    });
}

