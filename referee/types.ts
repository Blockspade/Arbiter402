export interface JobSpec {
  jobId: number;
  poolAddress: string;
  token0: string;
  token1: string;
  startBlock: number;
  endBlock: number;
  metric: "VWAP" | "VOLUME" | "AVERAGE_PRICE";
  toleranceBps: number; // 100 bps = 1.00%
}

export interface DeliverablePayload {
  jobId: number;
  metric: string;
  value: number;
  sampleCount: number;
  calculatedAt: number;
  notes?: string;
}

export interface AdjudicationResult {
  jobId: number;
  sellerValue: number;
  groundTruthValue: number;
  absoluteDelta: number;
  deltaPercent: number;
  tolerancePercent: number;
  isValid: boolean;
  verdict: "SELLER_WINS" | "BUYER_REFUND_AND_SLASH";
  reason: string;
  calculatedAt: number;
}

export interface HcsAuditProof {
  protocol: "Arbiter402";
  version: "1.0.0";
  jobId: number;
  specHash: string;
  resultHash: string;
  adjudication: AdjudicationResult;
  timestamp: number;
  topicId: string;
  consensusTimestamp: string;
  sequenceNumber: number;
  refereeAddress: string;
  refereeSignature: string;
  hashscanUrl: string;
}
