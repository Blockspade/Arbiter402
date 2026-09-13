import { GraphClient } from "./graphClient";
import { Adjudicator } from "./adjudicator";
import { JobSpec, DeliverablePayload } from "./types";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("\n=======================================================================");
  console.log("🔍   THE GRAPH ORACLE & ADJUDICATION INSPECTOR");
  console.log("     Verifying Ground-Truth Ingestion, Calculations, and Slashing Logic");
  console.log("=======================================================================\n");

  // 1. Define the Job Specification agreed upon in the Escrow contract
  const spec: JobSpec = {
    jobId: 1,
    poolAddress: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640", // Uniswap v3 ETH/USDC 0.05% pool
    token0: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    token1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    startBlock: 20000000,
    endBlock: 20000100,
    metric: "VWAP",
    toleranceBps: 100, // 100 bps = 1.00%
  };

  console.log("📋 1. ESCROW JOB SPECIFICATION (Agreed onchain in ArbiterEscrow.sol):");
  console.log(`   • Job ID             : #${spec.jobId}`);
  console.log(`   • Target Pool        : ${spec.poolAddress} (Uniswap v3 ETH/USDC)`);
  console.log(`   • Block Range        : [${spec.startBlock} ──> ${spec.endBlock}] (100 Ethereum blocks)`);
  console.log(`   • Target Metric      : Volume-Weighted Average Price (VWAP)`);
  console.log(`   • Allowed Tolerance  : ${spec.toleranceBps} bps (${spec.toleranceBps / 100}%)\n`);

  // 2. Show the exact GraphQL query sent to The Graph
  console.log("📡 2. GRAPHQL QUERY SENT TO THE GRAPH SUBGRAPH:");
  console.log(`
  query GetSwaps($pool: String!, $startBlock: BigInt!, $endBlock: BigInt!) {
    swaps(
      where: {
        pool: "${spec.poolAddress.toLowerCase()}"
        transaction_: { blockNumber_gte: ${spec.startBlock}, blockNumber_lte: ${spec.endBlock} }
      }
      orderBy: timestamp
      orderDirection: asc
      first: 100
    ) {
      id
      amount0      # WETH traded
      amount1      # USDC traded
      amountUSD    # Total USD notional volume
      sqrtPriceX96 # Raw Uniswap v3 sqrt price
      timestamp    # Block execution time
    }
  }
  `);

  // 3. Execute The Graph Ground-Truth calculation
  console.log("⚡ 3. EXECUTING GROUND-TRUTH COMPUTATION VIA GRAPH CLIENT...");
  const client = new GraphClient();
  const groundTruth = await client.computeGroundTruth(spec);

  console.log(`   ✅ Data Source       : ${groundTruth.source}`);
  console.log(`   ✅ Swaps Ingested    : ${groundTruth.sampleCount} onchain swap events`);
  console.log(`   ✅ Ground-Truth VWAP : $${groundTruth.groundTruthValue}\n`);

  // 4. Mathematical Formula breakdown
  console.log("🧮 4. MATHEMATICAL VWAP FORMULA APPLIED:");
  console.log("   VWAP = ∑(Price_i × VolumeUSD_i) / ∑(VolumeUSD_i)");
  console.log("   Where Price_i = |amountUSDC_i| / |amountWETH_i|");
  console.log(`   ==> True Benchmark Price: $${groundTruth.groundTruthValue}\n`);

  // 5. Compare with Seller Agent's submitted deliverable
  const rogueDeliverable: DeliverablePayload = {
    jobId: spec.jobId,
    metric: "VWAP",
    value: 3842.10, // Defective/hallucinated calculation submitted by Rogue Seller
    sampleCount: 42,
    calculatedAt: Math.floor(Date.now() / 1000),
  };

  console.log("📦 5. SELLER AGENT SUBMITTED DELIVERABLE (Stored onchain in ArbiterEscrow):");
  console.log(`   • Submitted VWAP     : $${rogueDeliverable.value}`);
  console.log(`   • Calculation Time   : ${new Date(rogueDeliverable.calculatedAt * 1000).toISOString()}\n`);

  // 6. Adjudicator Invariant Evaluation
  console.log("⚖️  6. ADJUDICATOR INVARIANT EVALUATION (referee/adjudicator.ts):");
  const adjudicator = new Adjudicator();
  const result = adjudicator.adjudicate(spec, rogueDeliverable, groundTruth.groundTruthValue);

  console.log(`   • Ground Truth (True): $${result.groundTruthValue}`);
  console.log(`   • Seller Output      : $${result.sellerValue}`);
  console.log(`   • Absolute Delta     : $${result.absoluteDelta} (|3842.10 - 3214.50|)`);
  console.log(`   • Percentage Error   : +${result.deltaPercent}% ((627.60 / 3214.50) * 100)`);
  console.log(`   • Max Tolerance      : ${result.tolerancePercent}% (${spec.toleranceBps} bps)`);
  console.log(`   • Is Valid?          : ${result.isValid ? "YES (PASSED)" : "NO (FAILED)"}`);
  console.log(`   • Adjudication Verdict: ${result.verdict}`);
  console.log(`   • Ruling Rationale   : "${result.reason}"\n`);

  // 7. Onchain consequence
  console.log("⛓️  7. ONCHAIN SMART CONTRACT SETTLEMENT CONSEQUENCE:");
  console.log("   When Referee calls resolveDispute(jobId=1, isValid=false, auditLogUri):");
  console.log("   1. ArbiterEscrow.sol refunds 100% of the locked deposit to Buyer.");
  console.log("   2. ArbiterEscrow.sol calls ERC8004ReputationRegistry.slashAgent(seller, 50).");
  console.log("   3. Rogue Seller reputation score drops from 100 to 50 pts onchain.\n");
  console.log("=======================================================================\n");
}

main().catch(console.error);
