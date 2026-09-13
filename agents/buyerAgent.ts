import { ethers } from "hardhat";
import { JobSpec } from "../referee/types";

export class BuyerAgent {
  public name = "BuyerAgent_Alpha (DeFi Portfolio Bot)";
  private signer: any;
  private escrowContract: any;

  constructor(signer: any, escrowContract: any) {
    this.signer = signer;
    this.escrowContract = escrowContract ? escrowContract.connect(signer) : null;
  }

  /**
   * Generates a DeFi analytics specification for historical VWAP.
   */
  createJobSpec(jobId: number): JobSpec {
    return {
      jobId,
      poolAddress: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640", // Uniswap v3 ETH/USDC
      token0: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      token1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      startBlock: 20000000,
      endBlock: 20000100,
      metric: "VWAP",
      toleranceBps: 100, // 1.00% allowable deviation
    };
  }

  /**
   * Locks micro-escrow funds in ArbiterEscrow.sol.
   */
  async lockEscrow(sellerAddress: string, spec: JobSpec, depositHbar: string): Promise<number> {
    const specHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(spec)));
    const depositWei = ethers.parseEther(depositHbar);
    const duration = 600; // 10 minutes

    console.log(`🤖 [${this.name}] Locking ${depositHbar} HBAR conditional escrow for Seller ${sellerAddress.slice(0, 8)}...`);
    const tx = await this.escrowContract.createJob(sellerAddress, specHash, duration, {
      value: depositWei,
    });
    const receipt = await tx.wait();

    // Find JobCreated event
    const event = receipt.logs
      .map((log: any) => {
        try {
          return this.escrowContract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e: any) => e && e.name === "JobCreated");

    const jobId = event ? Number(event.args.jobId) : spec.jobId;
    console.log(`🔒 [${this.name}] Escrow Locked! Job ID #${jobId} (Tx: ${receipt.hash.slice(0, 10)}...)`);
    return jobId;
  }

  /**
   * Confirms payment release on happy path.
   */
  async confirm(jobId: number) {
    console.log(`👍 [${this.name}] Deliverable verified within tolerance. Confirming payment...`);
    const tx = await this.escrowContract.confirmDelivery(jobId);
    await tx.wait();
    console.log(`💸 [${this.name}] Escrow released to Seller!`);
  }

  /**
   * Raises a formal dispute on defective deliverable.
   */
  async dispute(jobId: number, reason: string) {
    console.log(`🚨 [${this.name}] Flagging dispute on Job #${jobId}: "${reason}"`);
    const tx = await this.escrowContract.raiseDispute(jobId, reason);
    await tx.wait();
    console.log(`⚖️ [${this.name}] Dispute submitted. Awaiting automated referee adjudication...`);
  }
}

if (require.main === module) {
  console.log("🤖 BuyerAgent module ready.");
}
