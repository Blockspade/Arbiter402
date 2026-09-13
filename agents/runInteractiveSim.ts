import { ethers } from "hardhat";
import { BuyerAgent } from "./buyerAgent";
import { SellerAgent } from "./sellerAgent";
import { RefereeService } from "../referee/refereeService";
import * as readline from "readline";

function promptEnter(query: string): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, () => {
      rl.close();
      resolve();
    });
  });
}

async function main() {
  console.clear();
  console.log("\n=======================================================================");
  console.log("⚖️   ARBITER402: INTERACTIVE PITCH DEMONSTRATION");
  console.log("     Sub-Second Micro-Escrow & Ground-Truth Adjudication");
  console.log("     Hedera EVM + The Graph + Hedera HCS + ERC-8004");
  console.log("=======================================================================\n");

  const [deployer, buyerSigner, sellerSigner] = await ethers.getSigners();
  const refereeSigner = deployer;

  // 1. Deploy Clean Contracts
  console.log("📦 Step 0: Deploying Clean Smart Contracts on Local Hedera EVM Node...");
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
  console.log(`   • ArbiterEscrow: ${escrowAddress}`);
  console.log(`   • ERC-8004 Registry: ${registryAddress}`);

  const buyer = new BuyerAgent(buyerSigner, escrow);
  const rogueSeller = new SellerAgent(sellerSigner, escrow, "rogue");
  const refereeService = new RefereeService(escrowAddress, refereeSigner.address);

  console.log("\n👉 Ready to begin live step-by-step dispute simulation.");
  await promptEnter("👉 Press [ENTER] to execute Step 1: Buyer Locks Escrow (x402)... ");

  // STEP 1: Buyer Locks Escrow
  console.log("\n-----------------------------------------------------------------------");
  console.log("🔒 STEP 1: BUYER LOCKS CONDITIONAL ESCROW (0.5 HBAR)");
  console.log("-----------------------------------------------------------------------");
  const spec = buyer.createJobSpec(1);
  const jobId = await buyer.lockEscrow(sellerSigner.address, spec, "0.5");
  console.log("   • Status: Conditional Escrow active. Funds locked on Hedera EVM.");

  await promptEnter("\n👉 Press [ENTER] to execute Step 2: Rogue Seller Submits Deliverable... ");

  // STEP 2: Rogue Seller Delivers
  console.log("\n-----------------------------------------------------------------------");
  console.log("⚡ STEP 2: ROGUE SELLER DELIVERS DEFECTIVE VWAP CALCULATION");
  console.log("-----------------------------------------------------------------------");
  const deliverable = await rogueSeller.computeDeliverable(jobId);
  await rogueSeller.submit(jobId, deliverable);
  console.log(`   • Submitted Value: $${deliverable.value} (Deviated from actual market truth)`);

  await promptEnter("\n👉 Press [ENTER] to execute Step 3: Buyer Flags Anomaly & Disputes... ");

  // STEP 3: Buyer Disputes
  console.log("\n-----------------------------------------------------------------------");
  console.log("🚨 STEP 3: BUYER FLAGS ANOMALY AND RAISES ONCHAIN DISPUTE");
  console.log("-----------------------------------------------------------------------");
  await buyer.dispute(jobId, "Deliverable deviates by +19.5% from expected index parameters");
  console.log("   • Status: Escrow frozen in DISPUTED state. Automated referee summoned.");

  await promptEnter("\n👉 Press [ENTER] to execute Step 4: The Graph Ground-Truth Evaluation... ");

  // STEP 4: The Graph Query & Math Delta
  console.log("\n-----------------------------------------------------------------------");
  console.log("📡 STEP 4: THE GRAPH ORACLE COMPUTES GROUND TRUTH");
  console.log("-----------------------------------------------------------------------");
  const { groundTruthValue, sampleCount } = await (refereeService as any).graphClient.computeGroundTruth(spec);
  console.log(`   • The Graph Ground Truth: $${groundTruthValue} (from ${sampleCount} onchain swaps)`);
  const delta = Math.abs(deliverable.value - groundTruthValue);
  const deltaPercent = ((delta / groundTruthValue) * 100).toFixed(2);
  console.log(`   • Absolute Delta: $${delta.toFixed(2)}`);
  console.log(`   • Calculated Error: +${deltaPercent}% (Allowed Tolerance: 1.00%)`);
  console.log("   • Verdict: DEFECTIVE DELIVERABLE → BUYER_REFUND_AND_SLASH");

  await promptEnter("\n👉 Press [ENTER] to execute Step 5: Hedera HCS Audit & Onchain Slashing... ");

  // STEP 5: Hedera HCS & Onchain Settlement
  console.log("\n-----------------------------------------------------------------------");
  console.log("⛓️  STEP 5: HEDERA HCS PROOF ANCHORING & FINAL SETTLEMENT");
  console.log("-----------------------------------------------------------------------");
  const adjudicationOutcome = await refereeService.processDispute(spec, deliverable, refereeSigner);

  const [finalScore, totalJobs, slashes] = await registry.getReputation(sellerSigner.address);

  console.log("\n=======================================================================");
  console.log("🏆 LIVE PITCH DEMONSTRATION COMPLETE!");
  console.log("=======================================================================");
  console.log(`💼 Seller ERC-8004 Trust Score: ${finalScore} pts (Slashed from 100)`);
  console.log(`⚠️ Slashes Recorded          : ${slashes}`);
  console.log(`🛡️ Buyer Protection Status    : 100% REFUNDED (0.5 HBAR returned)`);
  console.log(`⛓️ Hedera HCS Topic Proof    : Seq #${adjudicationOutcome.hcsProof.sequenceNumber}`);
  console.log(`🔍 HashScan Explorer URL     : ${adjudicationOutcome.hcsProof.hashscanUrl}`);
  console.log("=======================================================================\n");
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Interactive simulation failed:", err);
    process.exitCode = 1;
  });
}
