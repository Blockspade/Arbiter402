import { JobSpec, DeliverablePayload, AdjudicationResult } from "./types";

export class Adjudicator {
  /**
   * Mathematically adjudicates seller deliverable against ground-truth data.
   * Hardened against division-by-zero, NaN, and float overflow.
   */
  public adjudicate(
    spec: JobSpec,
    deliverable: DeliverablePayload,
    groundTruthValue: number
  ): AdjudicationResult {
    const sellerValue = deliverable.value;

    // Defense: Validate finite numeric inputs
    if (!Number.isFinite(sellerValue) || !Number.isFinite(groundTruthValue)) {
      return {
        jobId: spec.jobId,
        sellerValue: Number.isFinite(sellerValue) ? sellerValue : 0,
        groundTruthValue: Number.isFinite(groundTruthValue) ? groundTruthValue : 0,
        absoluteDelta: 999999,
        deltaPercent: 100,
        tolerancePercent: spec.toleranceBps / 100,
        isValid: false,
        verdict: "BUYER_REFUND_AND_SLASH",
        reason: "Invalid numerical deliverable: non-finite or NaN value detected.",
        calculatedAt: Math.floor(Date.now() / 1000),
      };
    }

    const absoluteDelta = Math.abs(sellerValue - groundTruthValue);
    const denominator = Math.abs(groundTruthValue);

    // Defense: Safe division by zero handling
    const deltaPercent =
      denominator > 0
        ? (absoluteDelta / denominator) * 100
        : (sellerValue === 0 ? 0 : 100);

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
