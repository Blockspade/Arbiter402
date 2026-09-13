import { JobSpec, DeliverablePayload, AdjudicationResult } from "./types";

export class Adjudicator {
  /**
   * Mathematically adjudicates seller deliverable against ground-truth data.
   */
  public adjudicate(
    spec: JobSpec,
    deliverable: DeliverablePayload,
    groundTruthValue: number
  ): AdjudicationResult {
    const sellerValue = deliverable.value;
    const absoluteDelta = Math.abs(sellerValue - groundTruthValue);
    const deltaPercent = (absoluteDelta / groundTruthValue) * 100;
    const tolerancePercent = spec.toleranceBps / 100;

    const isValid = deltaPercent <= tolerancePercent;
    const verdict = isValid ? "SELLER_WINS" : "BUYER_REFUND_AND_SLASH";

    let reason: string;
    if (isValid) {
      reason = `Deliverable verified: deviation of ${deltaPercent.toFixed(
        2
      )}% is within the allowable tolerance of ${tolerancePercent.toFixed(2)}%.`;
    } else {
      reason = `Defective deliverable: deviation of ${deltaPercent.toFixed(
        2
      )}% exceeds the allowable tolerance of ${tolerancePercent.toFixed(
        2
      )}%. Potential hallucination or malicious computation.`;
    }

    return {
      jobId: spec.jobId,
      sellerValue,
      groundTruthValue,
      absoluteDelta: parseFloat(absoluteDelta.toFixed(4)),
      deltaPercent: parseFloat(deltaPercent.toFixed(2)),
      tolerancePercent,
      isValid,
      verdict,
      reason,
      calculatedAt: Math.floor(Date.now() / 1000),
    };
  }
}
