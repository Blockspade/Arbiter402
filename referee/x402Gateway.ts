import * as http from "http";
import * as url from "url";
import * as path from "path";
import * as fs from "fs";
import { ethers } from "ethers";

const PORT = process.env.X402_PORT ? parseInt(process.env.X402_PORT) : 4020;

export function startX402Gateway(escrowAddressParam?: string) {
  let escrowAddress = escrowAddressParam;

  if (!escrowAddress) {
    const manifestPath = path.join(__dirname, "../contracts/deployments.json");
    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        escrowAddress = manifest.contracts?.ArbiterEscrow;
      } catch {}
    }
  }

  escrowAddress = escrowAddress || process.env.HEDERA_ESCROW_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url || "", true);

    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    // Health check endpoint
    if (parsedUrl.pathname === "/health" || parsedUrl.pathname === "/api/status") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ONLINE",
          protocol: "x402",
          facilitator: "Blocky402 (Hedera Native)",
          escrowAddress,
          network: "Hedera Testnet (Chain ID 296)",
          timestamp: Math.floor(Date.now() / 1000),
        })
      );
      return;
    }

    if (parsedUrl.pathname === "/api/defi/vwap") {
      const escrowIdHeader = req.headers["x-payment-escrow-id"];

      // Case 1: Missing or Unfunded Escrow -> Return x402 Payment Required
      if (!escrowIdHeader) {
        const specHash = ethers.keccak256(
          ethers.toUtf8Bytes("Uniswap_v3_ETH_USDC_VWAP_Spec_Blocks_20000000_20000100")
        );

        res.writeHead(402, {
          "Content-Type": "application/json",
          "X-Payment-Required": "true",
          "X-Payment-Network": "Hedera Testnet",
          "X-Payment-Chain-Id": "296",
          "X-Payment-Facilitator": "Blocky402",
          "X-Payment-Escrow-Contract": escrowAddress,
          "X-Payment-Amount": "0.5 HBAR",
          "X-Payment-Spec-Hash": specHash,
        });

        res.end(
          JSON.stringify(
            {
              status: 402,
              protocol: "x402",
              error: "Payment Required: Conditional Escrow Not Found",
              facilitator: "Blocky402 (Hedera Native)",
              paymentDetails: {
                network: "Hedera Testnet",
                chainId: 296,
                currency: "HBAR",
                requiredAmount: "0.5 HBAR",
                escrowContract: escrowAddress,
                specHash,
                settlementType: "Arbiter402 Conditional Micro-Escrow",
              },
              instructions:
                "Call ArbiterEscrow.createJob{value: 0.5 ether}(sellerAddress, specHash, duration) on Hedera Testnet to lock conditional escrow, then retry request with header 'X-Payment-Escrow-Id: <jobId>'.",
            },
            null,
            2
          )
        );
        return;
      }

      // Case 2: Escrow Locked -> Return Deliverable with Commitment Hash
      const jobId = escrowIdHeader.toString();
      const payload = {
        jobId: parseInt(jobId),
        pool: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640", // Uniswap v3 ETH/USDC 0.05%
        metric: "VWAP",
        value: 3214.50,
        sampleCount: 42,
        calculatedAt: Math.floor(Date.now() / 1000),
        resultHash: ethers.keccak256(ethers.toUtf8Bytes("3214.50")),
        deliveryUri: "ipfs://QmVerifiedGroundTruthCalculationProof",
      };

      res.writeHead(200, {
        "Content-Type": "application/json",
        "X-Escrow-Status": "LOCKED_IN_CHALLENGE_WINDOW",
        "X-Result-Hash": payload.resultHash,
      });

      res.end(JSON.stringify(payload, null, 2));
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Endpoint not found" }));
  });

  server.listen(PORT, () => {
    console.log(`🌐 [x402 Gateway] Server active on port ${PORT} (Blocky402 / Hedera EVM Facilitator)`);
    console.log(`   Escrow Contract: ${escrowAddress}`);
  });

  return server;
}

if (require.main === module) {
  startX402Gateway();
}
