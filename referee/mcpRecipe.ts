import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { GraphClient } from "./graphClient";
import { Adjudicator } from "./adjudicator";
import { HcsLogger } from "./hcsLogger";
import { JobSpec, DeliverablePayload } from "./types";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * =========================================================================
 * BAZANTIC RECIPE SPECIFICATION
 * Track: Best Recipe that uses EthGlobal Hackathon Sponsor APIs ($1,000)
 * Sponsors Combined: The Graph (Ground-Truth Oracle) + Hedera (EVM & HCS)
 * =========================================================================
 */
export const BAZANTIC_RECIPE_METADATA = {
  recipeName: "Arbiter402 Ground-Truth Dispute Adjudicator",
  version: "1.0.0",
  author: "Blockspade Team",
  description:
    "An autonomous MCP Recipe that settles machine-to-machine escrow disputes by evaluating agent deliverables against The Graph's deterministic subgraphs and recording cryptographic verdicts to Hedera Consensus Service (HCS).",
  servicesUsed: [
    {
      name: "The Graph Decentralized Subgraphs",
      role: "Ground Truth Oracle (verifiable historical swaps and VWAP)",
    },
    {
      name: "Hedera Consensus Service (HCS)",
      role: "Immutable, timestamped consensus audit trail on HashScan",
    },
    {
      name: "Hedera EVM (ArbiterEscrow.sol & ERC-8004 Registry)",
      role: "Sub-second, sub-cent conditional micro-escrow settlement & slashing",
    },
  ],
  workflowSteps: [
    "1. Ingest buyer dispute parameters and job specification.",
    "2. Query The Graph for exact onchain historical swap data over the requested block window.",
    "3. Compute the deterministic ground-truth metric (mu_true).",
    "4. Evaluate seller's submitted deliverable (mu_seller) against mu_true within mathematical tolerance.",
    "5. Format cryptographic proof and anchor to Hedera Consensus Service (HCS) Topic.",
    "6. Execute atomic settlement on Hedera EVM: refund buyer & slash rogue seller (-50) OR release payout to seller (+5).",
  ],
};

export class ArbiterMcpServer {
  private server: Server;
  private graphClient: GraphClient;
  private adjudicator: Adjudicator;
  private hcsLogger: HcsLogger;

  constructor() {
    this.server = new Server(
      {
        name: "arbiter402-referee",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.graphClient = new GraphClient();
    this.adjudicator = new Adjudicator();
    this.hcsLogger = new HcsLogger(process.env.HEDERA_REFEREE_ADDRESS || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available MCP tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "adjudicate_escrow_dispute",
            description:
              "Orchestrates full dispute resolution: pulls ground truth from The Graph, runs mathematical delta calculation, logs audit proof to Hedera HCS, and calculates ERC-8004 slashing outcome.",
            inputSchema: {
              type: "object",
              properties: {
                jobId: { type: "number", description: "The escrow job identifier" },
                poolAddress: { type: "string", description: "Uniswap v3 pool address" },
                startBlock: { type: "number", description: "Starting block number" },
                endBlock: { type: "number", description: "Ending block number" },
                sellerValue: { type: "number", description: "Value submitted by seller agent" },
                toleranceBps: { type: "number", description: "Tolerance in basis points (e.g. 100 = 1%)" },
              },
              required: ["jobId", "poolAddress", "startBlock", "endBlock", "sellerValue", "toleranceBps"],
            },
          },
          {
            name: "query_the_graph_ground_truth",
            description: "Directly queries The Graph decentralized subgraphs for verifiable onchain ground-truth metrics.",
            inputSchema: {
              type: "object",
              properties: {
                poolAddress: { type: "string", description: "Uniswap v3 pool address" },
                startBlock: { type: "number", description: "Starting block number" },
                endBlock: { type: "number", description: "Ending block number" },
              },
              required: ["poolAddress", "startBlock", "endBlock"],
            },
          },
          {
            name: "get_bazantic_recipe_info",
            description: "Returns the complete Bazantic Recipe specification and multi-sponsor workflow documentation.",
            inputSchema: { type: "object", properties: {} },
          },
        ],
      };
    });

    // Execute MCP Tool Calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === "get_bazantic_recipe_info") {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(BAZANTIC_RECIPE_METADATA, null, 2),
            },
          ],
        };
      }

      if (name === "query_the_graph_ground_truth") {
        const { poolAddress, startBlock, endBlock } = (args || {}) as any;
        if (!poolAddress || startBlock === undefined || endBlock === undefined) {
          throw new Error("Missing required arguments: poolAddress, startBlock, endBlock");
        }

        const spec: JobSpec = {
          jobId: 0,
          poolAddress,
          token0: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          token1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          startBlock: Number(startBlock),
          endBlock: Number(endBlock),
          metric: "VWAP",
          toleranceBps: 100,
        };

        const result = await this.graphClient.computeGroundTruth(spec);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      if (name === "adjudicate_escrow_dispute") {
        const { jobId, poolAddress, startBlock, endBlock, sellerValue, toleranceBps } = (args || {}) as any;
        if (jobId === undefined || !poolAddress || startBlock === undefined || endBlock === undefined || sellerValue === undefined) {
          throw new Error("Missing required arguments for dispute adjudication");
        }

        const spec: JobSpec = {
          jobId: Number(jobId),
          poolAddress,
          token0: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          token1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          startBlock: Number(startBlock),
          endBlock: Number(endBlock),
          metric: "VWAP",
          toleranceBps: Number(toleranceBps || 100),
        };

        const deliverable: DeliverablePayload = {
          jobId: Number(jobId),
          metric: "VWAP",
          value: Number(sellerValue),
          sampleCount: 42,
          calculatedAt: Math.floor(Date.now() / 1000),
        };

        // 1. Fetch from The Graph
        const { groundTruthValue, sampleCount, source } = await this.graphClient.computeGroundTruth(spec);

        // 2. Adjudicate
        const adjudication = this.adjudicator.adjudicate(spec, deliverable, groundTruthValue);

        // 3. Log to Hedera HCS
        const specHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(spec)));
        const resultHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(deliverable)));
        const hcsProof = await this.hcsLogger.logDisputeProof(Number(jobId), specHash, resultHash, adjudication);

        const responsePayload = {
          recipe: BAZANTIC_RECIPE_METADATA.recipeName,
          status: "SUCCESS",
          adjudication: {
            verdict: adjudication.verdict,
            sellerSubmitted: sellerValue,
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
            refereeSignature: hcsProof.refereeSignature,
            hashscanExplorer: hcsProof.hashscanUrl,
          },
        };

        return {
          content: [{ type: "text", text: JSON.stringify(responsePayload, null, 2) }],
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Standalone execution
if (require.main === module) {
  console.log("🚀 Starting Bazantic MCP Recipe Server for Arbiter402...");
  const mcpServer = new ArbiterMcpServer();
  mcpServer.start().catch((err) => {
    console.error("Fatal MCP Server Error:", err);
    process.exit(1);
  });
}
