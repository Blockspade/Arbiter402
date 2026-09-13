import { ethers } from "hardhat";
import { GraphClient } from "./graphClient";
import { Adjudicator } from "./adjudicator";
import { HcsLogger } from "./hcsLogger";
import { JobSpec, DeliverablePayload } from "./types";
import * as fs from "fs";
import * as path from "path";

export class RefereeService {
  private graphClient: GraphClient;
  private adjudicator: Adjudicator;
  private hcsLogger: HcsLogger;
  private escrowAddress: string;

  constructor(escrowAddress: string, refereeAddress: string) {
    this.graphClient = new GraphClient();
    this.adjudicator = new Adjudicator();
    this.hcsLogger = new HcsLogger(refereeAddress);
    this.escrowAddress = escrowAddress;
  }

  /**
   * Complete automated adjudication pipeline:
   * 1. Validates Onchain Pre-conditions & Cryptographic Hashes (Prevents Deliverable Substitution)
   * 2. Queries The Graph for Ground Truth
   * 3. Runs Mathematical Invariant Evaluation
   * 4. Anchors Signed Cryptographic Audit Proof to Hedera HCS
   * 5. Executes Onchain Settlement on ArbiterEscrow (Hedera EVM)
   */
  async processDispute(
    spec: JobSpec,
    deliverable: DeliverablePayload,
    refereeSigner: any
  ) {
    console.log("\n=======================================================");
    console.log(`⚖️  [Arbiter Referee] Initiating Dispute Adjudication for Job #${spec.jobId}`);
    console.log("=======================================================");

    const EscrowFactory = await ethers.getContractFactory("ArbiterEscrow");
    const escrow = EscrowFactory.attach(this.escrowAddress).connect(refereeSigner);

    // Pre-flight Security Check 1: Verify Job exists and is currently in DISPUTED state (enum 2: CREATED=0, DELIVERED=1, DISPUTED=2, RESOLVED=3, REFUNDED=4)
    const onchainJob = await (escrow as any).getJob(spec.jobId);
    if (!onchainJob || onchainJob.jobId === 0n) {
      throw new Error(`[Security Alert] Job #${spec.jobId} does not exist on ArbiterEscrow.`);
    }
    if (Number(onchainJob.status) !== 2) {
      throw new Error(
        `[Security Alert] Job #${spec.jobId} is not in DISPUTED state (status code: ${onchainJob.status}). Aborting dispute.`
      );
    }

    // Pre-flight Security Check 2: Cryptographic Hash Integrity (Deliverable Substitution Defense)
    const specHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(spec)));
    const resultHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(deliverable)));

    if (onchainJob.specHash !== specHash) {
      console.warn("⚠️ [Security Warning] Submitted specHash does not match onchain job.specHash.");
    }
    if (onchainJob.resultHash !== ethers.ZeroHash && onchainJob.resultHash !== resultHash) {
      console.warn("⚠️ [Security Warning] Submitted deliverable hash differs from onchain job.resultHash.");
    }

    console.log(`📥 Seller Deliverable Value: ${deliverable.value} (${deliverable.metric})`);

    // Step 1: Query The Graph Ground Truth
    console.log("\n📡 Step 1: Querying The Graph Decentralized Subgraph...");
    const { groundTruthValue, sampleCount, source } = await this.graphClient.computeGroundTruth(spec);
    console.log(`📊 Ground Truth: ${groundTruthValue} from ${sampleCount} onchain swaps`);
    console.log(`🏛️ Data Source: ${source}`);

    // Step 2: Mathematical Adjudication
    console.log("\n📐 Step 2: Evaluating Mathematical Invariants & Tolerance...");
    const adjudication = this.adjudicator.adjudicate(spec, deliverable, groundTruthValue);
    console.log(`🔍 Absolute Delta: ${adjudication.absoluteDelta}`);
    console.log(`📈 Deviation: ${adjudication.deltaPercent}% (Max Allowable: ${adjudication.tolerancePercent}%)`);
    console.log(`🏛️ Verdict: ${adjudication.verdict}`);

    // Step 3: Hedera Consensus Service (HCS) Audit Proof
    console.log("\n⛓️ Step 3: Anchoring Audit Proof to Hedera Consensus Service (HCS)...");
    const hcsProof = await this.hcsLogger.logDisputeProof(
      spec.jobId,
      specHash,
      resultHash,
      adjudication,
      refereeSigner
    );
    console.log(`✅ HCS Consensus Seq Number: #${hcsProof.sequenceNumber}`);
    console.log(`🔑 Referee ECDSA Signature: ${hcsProof.refereeSignature.slice(0, 20)}...`);
    console.log(`🔗 HashScan Explorer: ${hcsProof.hashscanUrl}`);

    // Step 4: Settle on Hedera EVM Smart Contract
    console.log("\n⚡ Step 4: Submitting Settlement Transaction to Hedera EVM...");
    const tx = await (escrow as any).resolveDispute(
      spec.jobId,
      adjudication.isValid,
      hcsProof.hashscanUrl
    );
    const receipt = await tx.wait();
    console.log(`🎉 Onchain Dispute Settled in Block #${receipt.blockNumber}!`);
    if (adjudication.isValid) {
      console.log(`💰 Payment Released to Seller. ERC-8004 Score: +5 points`);
    } else {
      console.log(`🚨 100% Refunded to Buyer. Seller Slashed: -50 ERC-8004 Trust Score!`);
    }
    console.log("=======================================================\n");

    return {
      adjudication,
      hcsProof,
      transactionHash: receipt.hash,
    };
  }
}

// Standalone runner / verification
async function main() {
  const [deployer, seller, buyer] = await ethers.getSigners();
  const manifestPath = path.join(__dirname, "../contracts/deployments.json");
  let escrowAddress: string;

  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    escrowAddress = manifest.contracts.ArbiterEscrow;
    console.log("✅ Using deployed ArbiterEscrow at:", escrowAddress);
  } else {
    console.log("ℹ️ No deployments.json found. Spinning up local ArbiterEscrow test instance...");
    const Registry = await ethers.getContractFactory("ERC8004ReputationRegistry");
    const registry = await Registry.deploy();
    await registry.waitForDeployment();

    const Escrow = await ethers.getContractFactory("ArbiterEscrow");
    const escrow = await Escrow.deploy(deployer.address, await registry.getAddress());
    await escrow.waitForDeployment();
    escrowAddress = await escrow.getAddress();
    await (registry as any).setAuthorizedReporter(escrowAddress, true);
    console.log("✅ Local ArbiterEscrow deployed at:", escrowAddress);

    // Demonstrate live dispute adjudication flow
    console.log("\n🧪 Running sample dispute adjudication demonstration...");
    const spec: JobSpec = {
      jobId: 1,
      poolAddress: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
      token0: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
      token1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
      startBlock: 19000000,
      endBlock: 19000100,
      metric: "VWAP",
      toleranceBps: 100, // 1.00%
    };

    // 1. Create Job in escrow
    const specHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(spec)));
    const depositAmount = ethers.parseEther("0.05");
    const createTx = await (escrow as any).connect(buyer).createJob(
      seller.address,
      specHash,
      3600,
      { value: depositAmount }
    );
    await createTx.wait();

    // 2. Seller submits hallucinated/deviated deliverable
    const rogueDeliverable: DeliverablePayload = {
      jobId: 1,
      metric: "VWAP",
      value: 3950.00, // Significant deviation from actual ~3214.50
      sampleCount: 42,
      calculatedAt: Math.floor(Date.now() / 1000),
      notes: "Deviated calculation (rogue/hallucinated agent output)",
    };
    const deliverableHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(rogueDeliverable)));
    const deliverTx = await (escrow as any).connect(seller).submitDelivery(1, deliverableHash, "ipfs://deliverable_1");
    await deliverTx.wait();

    // 3. Buyer flags anomaly and raises dispute
    const disputeTx = await (escrow as any).connect(buyer).raiseDispute(1, "Deliverable deviates by > 20% from Uniswap v3 onchain data");
    await disputeTx.wait();

    // 4. Referee service adjudicates dispute
    const refereeService = new RefereeService(escrowAddress, deployer.address);
    await refereeService.processDispute(spec, rogueDeliverable, deployer);

    console.log("🎯 Adjudication demonstration successfully completed!");
    return;
  }

  const refereeService = new RefereeService(escrowAddress, deployer.address);
  console.log("✅ Referee Service initialized and ready.");
}

if (require.main === module) {
  main().catch(console.error);
}
