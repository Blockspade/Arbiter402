import { expect } from "chai";
import { ethers } from "hardhat";
import { ArbiterEscrow, ERC8004ReputationRegistry } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Arbiter402 Protocol: Hardened Escrow & ERC-8004 Security Tests", function () {
  let escrow: ArbiterEscrow;
  let registry: ERC8004ReputationRegistry;
  let owner: SignerWithAddress;
  let referee: SignerWithAddress;
  let buyer: SignerWithAddress;
  let seller: SignerWithAddress;
  let attacker: SignerWithAddress;

  const SPEC_HASH = ethers.keccak256(ethers.toUtf8Bytes("Uniswap_v3_ETH_USDC_VWAP_Spec"));
  const VALID_RESULT_HASH = ethers.keccak256(ethers.toUtf8Bytes("3214.50"));
  const DEFECTIVE_RESULT_HASH = ethers.keccak256(ethers.toUtf8Bytes("3842.10_Rogue"));
  const DEPOSIT = ethers.parseEther("1.0");
  const DURATION = 3600; // 1 hour

  beforeEach(async function () {
    [owner, referee, buyer, seller, attacker] = await ethers.getSigners();

    // 1. Deploy ERC-8004 Reputation Registry
    const RegistryFactory = await ethers.getContractFactory("ERC8004ReputationRegistry");
    registry = (await RegistryFactory.deploy()) as unknown as ERC8004ReputationRegistry;
    await registry.waitForDeployment();

    // 2. Deploy ArbiterEscrow
    const EscrowFactory = await ethers.getContractFactory("ArbiterEscrow");
    escrow = (await EscrowFactory.deploy(
      referee.address,
      await registry.getAddress()
    )) as unknown as ArbiterEscrow;
    await escrow.waitForDeployment();

    // 3. Authorize Escrow on the Reputation Registry
    await registry.setAuthorizedReporter(await escrow.getAddress(), true);
  });

  describe("1. Initialization & Baseline Reputation", function () {
    it("should deploy with correct referee and registry configuration", async function () {
      expect(await escrow.referee()).to.equal(referee.address);
      expect(await escrow.reputationRegistry()).to.equal(await registry.getAddress());
    });

    it("should initialize agents with baseline 100 trust score", async function () {
      const [score, jobs, slashes] = await registry.getReputation(seller.address);
      expect(score).to.equal(100n);
      expect(jobs).to.equal(0n);
      expect(slashes).to.equal(0n);
    });
  });

  describe("2. Job Creation & Security Validations", function () {
    it("should allow buyer to lock escrow deposit and emit JobCreated", async function () {
      const tx = await escrow.connect(buyer).createJob(seller.address, SPEC_HASH, DURATION, {
        value: DEPOSIT,
      });

      await expect(tx)
        .to.emit(escrow, "JobCreated")
        .withArgs(1n, buyer.address, seller.address, DEPOSIT, SPEC_HASH, (val: bigint) => val > 0n);

      const job = await escrow.getJob(1n);
      expect(job.status).to.equal(0n); // CREATED
      expect(job.amount).to.equal(DEPOSIT);
      expect(job.buyer).to.equal(buyer.address);
      expect(job.seller).to.equal(seller.address);
    });

    it("should revert if escrow deposit is 0", async function () {
      await expect(
        escrow.connect(buyer).createJob(seller.address, SPEC_HASH, DURATION, { value: 0 })
      ).to.be.revertedWith("ArbiterEscrow: escrow deposit must be > 0");
    });

    it("should revert if specHash is zero", async function () {
      await expect(
        escrow.connect(buyer).createJob(seller.address, ethers.ZeroHash, DURATION, { value: DEPOSIT })
      ).to.be.revertedWith("ArbiterEscrow: spec hash cannot be empty");
    });

    it("should revert if buyer and seller are identical", async function () {
      await expect(
        escrow.connect(buyer).createJob(buyer.address, SPEC_HASH, DURATION, { value: DEPOSIT })
      ).to.be.revertedWith("ArbiterEscrow: buyer and seller cannot be identical");
    });
  });

  describe("3. Delivery Submission", function () {
    beforeEach(async function () {
      await escrow.connect(buyer).createJob(seller.address, SPEC_HASH, DURATION, { value: DEPOSIT });
    });

    it("should allow seller to submit delivery payload hash", async function () {
      const deliveryUri = "ipfs://QmValidPayload";
      await expect(escrow.connect(seller).submitDelivery(1n, VALID_RESULT_HASH, deliveryUri))
        .to.emit(escrow, "DeliverySubmitted")
        .withArgs(1n, seller.address, VALID_RESULT_HASH, deliveryUri);

      const job = await escrow.getJob(1n);
      expect(job.status).to.equal(1n); // DELIVERED
      expect(job.resultHash).to.equal(VALID_RESULT_HASH);
    });

    it("should revert if non-seller attempts to submit delivery", async function () {
      await expect(
        escrow.connect(attacker).submitDelivery(1n, VALID_RESULT_HASH, "ipfs://fake")
      ).to.be.revertedWith("ArbiterEscrow: only seller can submit delivery");
    });
  });

  describe("4. Happy Path: Confirm Delivery & Payout", function () {
    beforeEach(async function () {
      await escrow.connect(buyer).createJob(seller.address, SPEC_HASH, DURATION, { value: DEPOSIT });
      await escrow.connect(seller).submitDelivery(1n, VALID_RESULT_HASH, "ipfs://QmValid");
    });

    it("should release 100% payment to seller and increase reputation by +5", async function () {
      const initialSellerBalance = await ethers.provider.getBalance(seller.address);

      const tx = await escrow.connect(buyer).confirmDelivery(1n);
      await expect(tx).to.emit(escrow, "JobConfirmed").withArgs(1n, seller.address, DEPOSIT);

      const finalSellerBalance = await ethers.provider.getBalance(seller.address);
      expect(finalSellerBalance - initialSellerBalance).to.equal(DEPOSIT);

      // Verify ERC-8004 Trust Score increased
      const [score, jobs, slashes] = await registry.getReputation(seller.address);
      expect(score).to.equal(105n); // 100 + 5
      expect(jobs).to.equal(1n);
      expect(slashes).to.equal(0n);

      const job = await escrow.getJob(1n);
      expect(job.status).to.equal(3n); // RESOLVED
    });
  });

  describe("5. Disputed Flow: Ground-Truth Adjudication & Slashing", function () {
    beforeEach(async function () {
      await escrow.connect(buyer).createJob(seller.address, SPEC_HASH, DURATION, { value: DEPOSIT });
      await escrow.connect(seller).submitDelivery(1n, DEFECTIVE_RESULT_HASH, "ipfs://QmRogueDeliverable");
    });

    it("should allow buyer to raise a dispute", async function () {
      await expect(escrow.connect(buyer).raiseDispute(1n, "Deviation exceeds 19%"))
        .to.emit(escrow, "DisputeRaised")
        .withArgs(1n, buyer.address, "Deviation exceeds 19%");

      const job = await escrow.getJob(1n);
      expect(job.status).to.equal(2n); // DISPUTED
      expect(job.disputeReason).to.equal("Deviation exceeds 19%");
    });

    it("should reject non-referee resolution attempts", async function () {
      await escrow.connect(buyer).raiseDispute(1n, "Defective VWAP");
      await expect(
        escrow.connect(attacker).resolveDispute(1n, false, "hcs://0.0.1234/audit")
      ).to.be.revertedWith("ArbiterEscrow: caller is not referee");
    });

    it("should refund 100% to buyer and slash seller reputation by -50 when seller is ruled defective", async function () {
      await escrow.connect(buyer).raiseDispute(1n, "Defective VWAP calculation");

      const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);
      const auditUri = "hcs://0.0.9876543/seq-42";

      // Referee rules against the rogue seller (sellerWon = false)
      const tx = await escrow.connect(referee).resolveDispute(1n, false, auditUri);
      await expect(tx)
        .to.emit(escrow, "DisputeResolved")
        .withArgs(1n, false, buyer.address, DEPOSIT, auditUri);

      // Verify buyer got refunded
      const finalBuyerBalance = await ethers.provider.getBalance(buyer.address);
      expect(finalBuyerBalance - initialBuyerBalance).to.equal(DEPOSIT);

      // Verify seller reputation slashed by -50 points
      const [score, jobs, slashes] = await registry.getReputation(seller.address);
      expect(score).to.equal(50n); // 100 - 50 = 50
      expect(jobs).to.equal(1n);
      expect(slashes).to.equal(1n);

      const job = await escrow.getJob(1n);
      expect(job.status).to.equal(4n); // REFUNDED
      expect(job.auditLogUri).to.equal(auditUri);
    });

    it("should payout seller and add +5 reputation if referee rules seller was honest", async function () {
      await escrow.connect(buyer).raiseDispute(1n, "False alarm dispute");

      const initialSellerBalance = await ethers.provider.getBalance(seller.address);
      const auditUri = "hcs://0.0.9876543/seq-43";

      // Referee rules in favor of seller (sellerWon = true)
      await escrow.connect(referee).resolveDispute(1n, true, auditUri);

      const finalSellerBalance = await ethers.provider.getBalance(seller.address);
      expect(finalSellerBalance - initialSellerBalance).to.equal(DEPOSIT);

      const [score, , slashes] = await registry.getReputation(seller.address);
      expect(score).to.equal(105n);
      expect(slashes).to.equal(0n);
    });
  });

  describe("6. Security Hardening: Challenge Window & Liveness Protection", function () {
    beforeEach(async function () {
      await escrow.connect(buyer).createJob(seller.address, SPEC_HASH, DURATION, { value: DEPOSIT });
      await escrow.connect(seller).submitDelivery(1n, VALID_RESULT_HASH, "ipfs://QmValid");
    });

    it("should allow seller to auto-claim uncontested delivery after challenge window expires", async function () {
      // Fast-forward past the challenge window (1 hour)
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine", []);

      const initialSellerBalance = await ethers.provider.getBalance(seller.address);

      const tx = await escrow.connect(seller).claimUncontestedDelivery(1n);
      const receipt = await tx.wait();
      const gasSpent = receipt!.gasUsed * receipt!.gasPrice;

      await expect(tx)
        .to.emit(escrow, "UncontestedSettlementClaimed")
        .withArgs(1n, seller.address, DEPOSIT);

      const finalSellerBalance = await ethers.provider.getBalance(seller.address);
      expect(finalSellerBalance - initialSellerBalance + gasSpent).to.equal(DEPOSIT);

      const job = await escrow.getJob(1n);
      expect(job.status).to.equal(3n); // RESOLVED
    });

    it("should revert if buyer attempts to dispute after challenge window has expired", async function () {
      // Fast-forward past challenge window
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        escrow.connect(buyer).raiseDispute(1n, "Too late dispute")
      ).to.be.revertedWith("ArbiterEscrow: challenge window has expired");
    });
  });

  describe("7. Security Hardening: Deadline Timeout & Abandonment", function () {
    it("should allow buyer to claim refund if seller failed to submit delivery before deadline", async function () {
      const shortDuration = 10;
      await escrow.connect(buyer).createJob(seller.address, SPEC_HASH, shortDuration, { value: DEPOSIT });

      // Fast-forward EVM time past deadline
      await ethers.provider.send("evm_increaseTime", [shortDuration + 5]);
      await ethers.provider.send("evm_mine", []);

      const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);

      const tx = await escrow.connect(buyer).claimTimeout(1n);
      const receipt = await tx.wait();
      const gasSpent = receipt!.gasUsed * receipt!.gasPrice;

      const finalBuyerBalance = await ethers.provider.getBalance(buyer.address);
      expect(finalBuyerBalance - initialBuyerBalance + gasSpent).to.equal(DEPOSIT);

      const job = await escrow.getJob(1n);
      expect(job.status).to.equal(4n); // REFUNDED

      // Seller trust score penalized -10 for timeout abandonment
      const [score, , ] = await registry.getReputation(seller.address);
      expect(score).to.equal(90n);
    });
  });
});
