import { BAZANTIC_RECIPE_METADATA } from "./mcpRecipe";
import { GraphClient } from "./graphClient";
import { Adjudicator } from "./adjudicator";
import { HcsLogger } from "./hcsLogger";
import { JobSpec, DeliverablePayload } from "./types";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("\n=======================================================================");
  console.log("🤖   BAZANTIC MCP RECIPE GATEWAY INSPECTOR");
  console.log("     Autonomous Multi-Protocol Ground-Truth Workflow");
  console.log("=======================================================================\n");

  console.log("📋 1. BAZANTIC RECIPE SPECIFICATION:");
  console.log(`   • Recipe Name   : ${BAZANTIC_RECIPE_METADATA.recipeName}`);
  console.log(`   • Author        : ${BAZANTIC_RECIPE_METADATA.author}`);
  console.log(`   • Version       : ${BAZANTIC_RECIPE_METADATA.version}`);
  console.log(`   • Description   : ${BAZANTIC_RECIPE_METADATA.description}\n`);

  console.log("🔌 2. INTEGRATED DECENTRALIZED PROTOCOLS COMBINED IN THIS RECIPE:");
  for (const svc of BAZANTIC_RECIPE_METADATA.servicesUsed) {
    console.log(`   • [${svc.name}] ──> ${svc.role}`);
  }

  console.log("\n🛠️  3. MCP TOOLS EXPOSED TO AI AGENTS (Claude Desktop, Cursor, LangChain):");
  console.log("   1. adjudicate_escrow_dispute(jobId, poolAddress, startBlock, endBlock, sellerValue, toleranceBps)");
  console.log("   2. query_the_graph_ground_truth(poolAddress, startBlock, endBlock)");
  console.log("   3. get_bazantic_recipe_info()\n");

  console.log("⚡ 4. SIMULATING AI AGENT CALLING 'adjudicate_escrow_dispute' VIA MCP...");
  const agentToolCallArgs = {
    jobId: 1,
    poolAddress: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
    startBlock: 20000000,
    endBlock: 20000100,
    sellerValue: 3842.10,
    toleranceBps: 100,
  };
  console.log("   Agent Arguments Ingested:", JSON.stringify(agentToolCallArgs, null, 2));

  // Run the multi-protocol recipe execution
  const spec: JobSpec = {
    jobId: agentToolCallArgs.jobId,
    poolAddress: agentToolCallArgs.poolAddress,
    token0: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    token1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    startBlock: agentToolCallArgs.startBlock,
    endBlock: agentToolCallArgs.endBlock,
    metric: "VWAP",
    toleranceBps: agentToolCallArgs.toleranceBps,
  };

  const deliverable: DeliverablePayload = {
    jobId: agentToolCallArgs.jobId,
    metric: "VWAP",
    value: agentToolCallArgs.sellerValue,
    sampleCount: 42,
    calculatedAt: Math.floor(Date.now() / 1000),
  };

  // Step A: Ingest from The Graph
  const graphClient = new GraphClient();
  const { groundTruthValue, sampleCount, source } = await graphClient.computeGroundTruth(spec);

  // Step B: Math Invariant Check
  const adjudicator = new Adjudicator();
  const adjudication = adjudicator.adjudicate(spec, deliverable, groundTruthValue);

  // Step C: Hedera HCS Anchor
  const hcsLogger = new HcsLogger(process.env.HEDERA_OPERATOR_ID ? "0xf9692Fa79ec1E3A78798445E5b720d9bF17E6AA2" : "0x00");
  const specHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(spec)));
  const resultHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(deliverable)));
  const hcsProof = await hcsLogger.logDisputeProof(spec.jobId, specHash, resultHash, adjudication);

  // Structured response returned to the AI Agent
  const mcpResponse = {
    recipe: BAZANTIC_RECIPE_METADATA.recipeName,
    status: "SUCCESS",
    adjudication: {
      verdict: adjudication.verdict,
      sellerSubmitted: agentToolCallArgs.sellerValue,
      graphGroundTruth: groundTruthValue,
      graphSource: source,
      samplesAnalyzed: sampleCount,
      deltaPercent: `${adjudication.deltaPercent}%`,
      allowedTolerance: `${adjudication.tolerancePercent}%`,
      isValid: adjudication.isValid,
      reason: adjudication.reason,
    },
    settlement: {
      action: adjudication.isValid ? "RELEASE_PAYMENT_TO_SELLER" : "REFUND_100_PERCENT_TO_BUYER",
      erc8004ReputationDelta: adjudication.isValid ? "+5 (HONEST)" : "-50 (SLASHED)",
    },
    hederaHcsAudit: {
      topicId: hcsProof.topicId,
      sequenceNumber: hcsProof.sequenceNumber,
      consensusTimestamp: hcsProof.consensusTimestamp,
      refereeSignature: hcsProof.refereeSignature.slice(0, 20) + "...",
      hashscanExplorer: hcsProof.hashscanUrl,
    },
  };

  console.log("\n📦 5. STRUCTURED MCP TOOL OUTPUT RETURNED TO AI AGENT:");
  console.log(JSON.stringify(mcpResponse, null, 2));

  console.log("\n=======================================================================");
  console.log("💡 KEY TAKEAWAY:");
  console.log("   Bazantic provides the MCP abstraction that lets any LLM agent natively");
  console.log("   orchestrate The Graph (oracle) and Hedera (escrow/audit) with zero custom glue!");
  console.log("=======================================================================\n");
  process.exit(0);
}

main().catch(console.error);
