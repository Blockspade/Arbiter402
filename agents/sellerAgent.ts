import { ethers } from "hardhat";
import { DeliverablePayload } from "../referee/types";

export type AgentMode = "honest" | "rogue";

export class SellerAgent {
  public name = "SellerAgent_Beta (ERC-8004 Analytics Worker)";
  private signer: any;
  private escrowContract: any;
  public mode: AgentMode;

  constructor(signer: any, escrowContract: any, mode: AgentMode = "honest") {
    this.signer = signer;
    this.escrowContract = escrowContract ? escrowContract.connect(signer) : null;
    this.mode = mode;
  }

  /**
   * Executes computational task (honest vs hallucinated/rogue).
   */
  async computeDeliverable(jobId: number): Promise<DeliverablePayload> {
    console.log(`⚡ [${this.name}] Executing VWAP computation (Mode: ${this.mode.toUpperCase()})...`);

    let value: number;
    let notes: string;

    if (this.mode === "honest") {
      value = 3214.50; // Accurate ground-truth metric
      notes = "Verified computation from indexed Uniswap v3 swap blocks.";
    } else {
      value = 3842.10; // Corrupted / hallucinated (+19.5% divergence)
      notes = "Hallucinated / synthetic payload with injected pricing variance.";
    }

    const deliverable: DeliverablePayload = {
      jobId,
      metric: "VWAP",
      value,
      sampleCount: 42,
      calculatedAt: Math.floor(Date.now() / 1000),
      notes,
    };

    return deliverable;
  }

  /**
   * Submits deliverable hash to ArbiterEscrow on Hedera EVM.
   */
  async submit(jobId: number, deliverable: DeliverablePayload) {
    const resultHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(deliverable)));
    const deliveryUri = `ipfs://Qm${Buffer.from(`job_${jobId}_val_${deliverable.value}`).toString("hex").slice(0, 32)}`;

    console.log(`📤 [${this.name}] Submitting Deliverable for Job #${jobId}:`);
    console.log(`   • Result Value: $${deliverable.value}`);
    console.log(`   • Result Hash: ${resultHash.slice(0, 14)}...`);

    const tx = await this.escrowContract.submitDelivery(jobId, resultHash, deliveryUri);
    const receipt = await tx.wait();
    console.log(`✅ [${this.name}] Delivery committed on Hedera EVM (Tx: ${receipt.hash.slice(0, 10)}...)`);
    return { resultHash, deliveryUri };
  }
}

if (require.main === module) {
  const mode: AgentMode = process.argv.includes("--mode=rogue") ? "rogue" : "honest";
  console.log(`🤖 Standalone SellerAgent running in ${mode.toUpperCase()} mode.`);
  const agent = new SellerAgent(null, null, mode);
  agent.computeDeliverable(1).then((deliverable) => {
    console.log("Calculated deliverable:", deliverable);
  });
}
