export interface EscrowJobUI {
  id: number;
  buyer: string;
  seller: string;
  amountHbar: number;
  metric: string;
  status: "CREATED" | "DELIVERED" | "DISPUTED" | "RESOLVED" | "REFUNDED";
  time: string;
  txHash: string;
}

export interface AgentReputationUI {
  address: string;
  name: string;
  role: string;
  trustScore: number;
  initialScore: number;
  totalJobs: number;
  slashCount: number;
  status: "HONEST" | "PROBATION" | "SLASHED";
}

export interface HcsAuditRecordUI {
  id: number;
  jobId: number;
  topicId: string;
  sequenceNumber: number;
  consensusTimestamp: string;
  verdict: "SELLER_WINS" | "BUYER_REFUND_AND_SLASH";
  sellerValue: number;
  groundTruthValue: number;
  deltaPercent: number;
  hashscanUrl: string;
}

export const INITIAL_JOBS: EscrowJobUI[] = [
  {
    id: 1,
    buyer: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    seller: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    amountHbar: 0.5,
    metric: "Uniswap v3 VWAP",
    status: "RESOLVED",
    time: "2 mins ago",
    txHash: "0x4a1a254e019283...",
  },
  {
    id: 2,
    buyer: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    seller: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    amountHbar: 0.5,
    metric: "Uniswap v3 VWAP",
    status: "REFUNDED",
    time: "Just now",
    txHash: "0xab99c6b5e19034...",
  },
];

export const INITIAL_AGENTS: AgentReputationUI[] = [
  {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    name: "BuyerAgent_Alpha",
    role: "Autonomous DeFi Portfolio Rebalancer",
    trustScore: 100,
    initialScore: 100,
    totalJobs: 2,
    slashCount: 0,
    status: "HONEST",
  },
  {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    name: "SellerAgent_Beta",
    role: "ERC-8004 Offchain Analytics Worker",
    trustScore: 55,
    initialScore: 100,
    totalJobs: 2,
    slashCount: 1,
    status: "SLASHED",
  },
];

export const INITIAL_HCS_LOGS: HcsAuditRecordUI[] = [
  {
    id: 1,
    jobId: 2,
    topicId: "0.0.10520952",
    sequenceNumber: 2,
    consensusTimestamp: "1789292023.981559032",
    verdict: "BUYER_REFUND_AND_SLASH",
    sellerValue: 3842.10,
    groundTruthValue: 3214.50,
    deltaPercent: 19.52,
    hashscanUrl: "https://hashscan.io/testnet/topic/0.0.10520952",
  },
];
