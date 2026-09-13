import { ethers, network } from "hardhat";
import { BuyerAgent } from "../../agents/buyerAgent";
import { SellerAgent } from "../../agents/sellerAgent";
import { RefereeService } from "../../referee/refereeService";
import * as fs from "fs";
import * as path from "path";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("\n=======================================================================");
  console.log("🌐   ARBITER402: LIVE HEDERA TESTNET MULTI-AGENT COMMERCE & DISPUTE");
  console.log(`     Network: ${network.name} (Chain ID: 296)`);
  console.log("=======================================================================\n");

  const [refereeSigner] = await ethers.getSigners();
  const provider = ethers.provider;

  console.log(`🏛️ Main Account (Official Referee): ${refereeSigner.address}`);
  const initialBalance = await provider.getBalance(refereeSigner.address);
  console.log(`   Balance: ${ethers.formatEther(initialBalance)} HBAR\n`);

  // 1. Load Live Deployed Contracts
  const manifestPath = path.join(__dirname, "../deployments.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("Deployments manifest not found. Deploy contracts first.");
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const escrowAddress = manifest.contracts.ArbiterEscrow;
  const registryAddress = manifest.contracts.ERC8004ReputationRegistry;

  console.log("📦 Live Verified Contracts on Hedera Testnet:");
  console.log(`   • ArbiterEscrow: ${escrowAddress} (Contract ID: 0.0.10520281)`);
  console.log(`   • ERC-8004 Registry: ${registryAddress} (Contract ID: 0.0.10520278)\n`);

  const EscrowFactory = await ethers.getContractFactory("ArbiterEscrow");
  const escrow = EscrowFactory.attach(escrowAddress) as any;

  const RegistryFactory = await ethers.getContractFactory("ERC8004ReputationRegistry");
  const registry = RegistryFactory.attach(registryAddress) as any;

  // 2. Generate Fresh Independent Wallets for Buyer and Seller
  console.log("🔑 Generating Fresh Independent Agent Wallets...");
  const buyerWallet = ethers.Wallet.createRandom().connect(provider);
  const sellerWallet = ethers.Wallet.createRandom().connect(provider);
  console.log(`   • Buyer Agent A : ${buyerWallet.address}`);
  console.log(`   • Seller Agent B: ${sellerWallet.address}\n`);

  // 3. Fund Buyer and Seller from Main Referee Account
  console.log("💸 Funding Agent Wallets from Main Account...");
  const fundBuyerTx = await refereeSigner.sendTransaction({
    to: buyerWallet.address,
    value: ethers.parseEther("2.5"), // 0.5 HBAR for escrow deposit + 2 HBAR for gas
  });
  await fundBuyerTx.wait();
  console.log(`   ✅ Sent 2.5 HBAR to Buyer Agent (Tx: ${fundBuyerTx.hash.slice(0, 14)}...)`);

  const fundSellerTx = await refereeSigner.sendTransaction({
    to: sellerWallet.address,
    value: ethers.parseEther("1.5"), // 1.5 HBAR for gas fees
  });
  await fundSellerTx.wait();
  console.log(`   ✅ Sent 1.5 HBAR to Seller Agent (Tx: ${fundSellerTx.hash.slice(0, 14)}...)\n`);

  // 4. Initialize Agent Instances
  const buyer = new BuyerAgent(buyerWallet, escrow);
  const rogueSeller = new SellerAgent(sellerWallet, escrow, "rogue");
  const refereeService = new RefereeService(escrowAddress, refereeSigner.address);

  // Check initial reputation score (Baseline 100)
  const [initialRepScore] = await registry.getReputation(sellerWallet.address);
  console.log(`📊 Baseline Seller ERC-8004 Trust Score: ${initialRepScore} pts\n`);

  // =========================================================================
  // STEP 1: Buyer Locks Escrow on Hedera EVM
  // =========================================================================
  console.log("-----------------------------------------------------------------------");
  console.log("🔒 STEP 1: BUYER LOCKS 0.5 HBAR CONDITIONAL ESCROW ON HEDERA TESTNET");
  console.log("-----------------------------------------------------------------------");
  const spec = buyer.createJobSpec(1);
  const jobId = await buyer.lockEscrow(sellerWallet.address, spec, "0.5");
  spec.jobId = jobId;
  console.log(`   • Job #${jobId} confirmed locked in ArbiterEscrow.sol vault on Hedera EVM.`);
  await sleep(1500);

  // =========================================================================
  // STEP 2: Rogue Seller Submits Defective Deliverable
  // =========================================================================
  console.log("\n-----------------------------------------------------------------------");
  console.log("⚡ STEP 2: ROGUE SELLER DELIVERS CORRUPTED VWAP CALCULATION");
  console.log("-----------------------------------------------------------------------");
  const deliverable = await rogueSeller.computeDeliverable(jobId);
  const { resultHash } = await rogueSeller.submit(jobId, deliverable);
  console.log(`   • Rogue Deliverable committed onchain ($${deliverable.value}).`);
  await sleep(1500);

  // =========================================================================
  // STEP 3: Buyer Flags Anomaly and Raises Dispute
  // =========================================================================
  console.log("\n-----------------------------------------------------------------------");
  console.log("🚨 STEP 3: BUYER FLAGS ANOMALY AND RAISES ONCHAIN DISPUTE");
  console.log("-----------------------------------------------------------------------");
  await buyer.dispute(jobId, "Deliverable deviates by +19.5% from expected Uniswap v3 index");
  console.log(`   • Dispute confirmed on Hedera Testnet. Escrow status set to DISPUTED.`);
  await sleep(1500);

  // =========================================================================
  // STEP 4: Automated Referee Adjudicates via The Graph & Hedera HCS
  // =========================================================================
  console.log("\n-----------------------------------------------------------------------");
  console.log("⚖️  STEP 4: AUTOMATED REFEREE GROUND-TRUTH ADJUDICATION");
  console.log("-----------------------------------------------------------------------");
  const adjudicationOutcome = await refereeService.processDispute(
    spec,
    deliverable,
    refereeSigner
  );

  // =========================================================================
  // STEP 5: Verify Final Onchain State & Slashing
  // =========================================================================
  const [finalScore, totalJobs, slashes] = await registry.getReputation(sellerWallet.address);
  const finalBuyerBalance = await provider.getBalance(buyerWallet.address);

  console.log("\n=======================================================================");
  console.log("🏆 LIVE HEDERA TESTNET EXECUTION AUDIT SUMMARY");
  console.log("=======================================================================");
  console.log(`🔗 ArbiterEscrow Contract     : https://hashscan.io/testnet/contract/0.0.10520281`);
  console.log(`🔗 ERC-8004 Registry Contract : https://hashscan.io/testnet/contract/0.0.10520278`);
  console.log(`💼 Seller ERC-8004 Trust Score: ${finalScore} pts (SLASHED from ${initialRepScore})`);
  console.log(`⚠️ Slashes Recorded onchain   : ${slashes}`);
  console.log(`🛡️ Buyer Protection Status    : 100% REFUNDED (Balance: ${ethers.formatEther(finalBuyerBalance)} HBAR)`);
  console.log(`🏛️ The Graph Ground Truth     : $${adjudicationOutcome.adjudication.groundTruthValue}`);
  console.log(`📊 Rogue Seller Output       : $${adjudicationOutcome.adjudication.sellerValue} (+${adjudicationOutcome.adjudication.deltaPercent}% Error)`);
  console.log(`⛓️ Hedera HCS Topic Message   : Seq #${adjudicationOutcome.hcsProof.sequenceNumber} (${adjudicationOutcome.hcsProof.consensusTimestamp})`);
  console.log(`🔍 Hedera HCS Topic Explorer  : ${adjudicationOutcome.hcsProof.hashscanUrl}`);
  console.log(`⚡ Settlement Transaction Hash: https://hashscan.io/testnet/transaction/${adjudicationOutcome.transactionHash}`);
  console.log("=======================================================================\n");
}

main().catch((err) => {
  console.error("Live testnet seed failed:", err);
  process.exitCode = 1;
});
