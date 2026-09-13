// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IArbiterEscrow.sol";
import "./interfaces/IERC8004.sol";

/**
 * @title ArbiterEscrow
 * @notice Sub-Second Conditional Micro-Escrow with Automated Ground-Truth Adjudication.
 * Built for Hedera EVM (Chain ID 296) and integrated with ERC-8004 Reputation Registry.
 * Hardened with:
 *  - Checks-Effects-Interactions pattern
 *  - Reentrancy protection
 *  - Push-with-pull fallback (immune to recipient contract DoS)
 *  - Liveness lock protection via challenge window (claimUncontestedDelivery)
 *  - Cross-contract call isolation via try/catch
 */
contract ArbiterEscrow is IArbiterEscrow {
    address public owner;
    address public referee;
    IERC8004 public reputationRegistry;

    uint256 private jobCounter;
    uint256 public constant DEFAULT_CHALLENGE_WINDOW = 3600; // 1 hour

    mapping(uint256 => Job) private jobs;
    mapping(address => uint256) public pendingWithdrawals;

    bool private locked;

    modifier onlyOwner() {
        require(msg.sender == owner, "ArbiterEscrow: caller is not owner");
        _;
    }

    modifier onlyReferee() {
        require(msg.sender == referee, "ArbiterEscrow: caller is not referee");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "ArbiterEscrow: reentrant call");
        locked = true;
        _;
        locked = false;
    }

    constructor(address _referee, address _reputationRegistry) {
        require(_referee != address(0), "ArbiterEscrow: invalid referee");
        require(_reputationRegistry != address(0), "ArbiterEscrow: invalid registry");
        owner = msg.sender;
        referee = _referee;
        reputationRegistry = IERC8004(_reputationRegistry);
    }

    function setReferee(address _newReferee) external onlyOwner {
        require(_newReferee != address(0), "ArbiterEscrow: zero address");
        referee = _newReferee;
    }

    function setReputationRegistry(address _newRegistry) external onlyOwner {
        require(_newRegistry != address(0), "ArbiterEscrow: zero address");
        reputationRegistry = IERC8004(_newRegistry);
    }

    /**
     * @notice Locks micro-escrow funds and creates a new job.
     */
    function createJob(
        address payable _seller,
        bytes32 _specHash,
        uint256 _duration
    ) external payable override nonReentrant returns (uint256) {
        require(msg.value > 0, "ArbiterEscrow: escrow deposit must be > 0");
        require(_specHash != bytes32(0), "ArbiterEscrow: spec hash cannot be empty");
        require(_seller != address(0), "ArbiterEscrow: seller cannot be zero address");
        require(_seller != msg.sender, "ArbiterEscrow: buyer and seller cannot be identical");
        require(_duration >= 5, "ArbiterEscrow: duration must be at least 5 seconds");

        jobCounter++;
        uint256 currentId = jobCounter;
        uint256 deadline = block.timestamp + _duration;

        jobs[currentId] = Job({
            jobId: currentId,
            buyer: payable(msg.sender),
            seller: _seller,
            amount: msg.value,
            specHash: _specHash,
            resultHash: bytes32(0),
            deliveryUri: "",
            deadline: deadline,
            challengeWindow: DEFAULT_CHALLENGE_WINDOW,
            status: JobStatus.CREATED,
            disputeReason: "",
            auditLogUri: "",
            createdAt: block.timestamp,
            deliveredAt: 0,
            resolvedAt: 0
        });

        emit JobCreated(currentId, msg.sender, _seller, msg.value, _specHash, deadline);
        return currentId;
    }

    /**
     * @notice Submits deliverable result hash before deadline.
     */
    function submitDelivery(
        uint256 _jobId,
        bytes32 _resultHash,
        string calldata _deliveryUri
    ) external override {
        Job storage job = jobs[_jobId];
        require(job.jobId != 0, "ArbiterEscrow: job does not exist");
        require(msg.sender == job.seller, "ArbiterEscrow: only seller can submit delivery");
        require(job.status == JobStatus.CREATED, "ArbiterEscrow: job not in CREATED state");
        require(block.timestamp <= job.deadline, "ArbiterEscrow: submission deadline exceeded");
        require(_resultHash != bytes32(0), "ArbiterEscrow: result hash cannot be empty");

        job.status = JobStatus.DELIVERED;
        job.resultHash = _resultHash;
        job.deliveryUri = _deliveryUri;
        job.deliveredAt = block.timestamp;

        emit DeliverySubmitted(_jobId, msg.sender, _resultHash, _deliveryUri);
    }

    /**
     * @notice Buyer confirms delivery on the happy path. Releases payment to seller.
     */
    function confirmDelivery(uint256 _jobId) external override nonReentrant {
        Job storage job = jobs[_jobId];
        require(job.jobId != 0, "ArbiterEscrow: job does not exist");
        require(msg.sender == job.buyer, "ArbiterEscrow: only buyer can confirm delivery");
        require(job.status == JobStatus.DELIVERED, "ArbiterEscrow: job not in DELIVERED state");

        job.status = JobStatus.RESOLVED;
        job.resolvedAt = block.timestamp;
        uint256 payout = job.amount;

        // Feedback: Reward seller +5 for honest delivery
        if (address(reputationRegistry) != address(0)) {
            try reputationRegistry.logFeedback(job.seller, 5, "Honest delivery confirmed by buyer") {} catch {}
        }

        _safeTransfer(job.seller, payout);

        emit JobConfirmed(_jobId, job.seller, payout);
    }

    /**
     * @notice Buyer flags deliverable as anomalous or defective within challenge window.
     */
    function raiseDispute(
        uint256 _jobId,
        string calldata _disputeReason
    ) external override {
        Job storage job = jobs[_jobId];
        require(job.jobId != 0, "ArbiterEscrow: job does not exist");
        require(msg.sender == job.buyer, "ArbiterEscrow: only buyer can dispute");
        require(job.status == JobStatus.DELIVERED, "ArbiterEscrow: job not in DELIVERED state");
        require(bytes(_disputeReason).length > 0, "ArbiterEscrow: reason required");
        require(
            block.timestamp <= job.deliveredAt + job.challengeWindow,
            "ArbiterEscrow: challenge window has expired"
        );

        job.status = JobStatus.DISPUTED;
        job.disputeReason = _disputeReason;

        emit DisputeRaised(_jobId, msg.sender, _disputeReason);
    }

    /**
     * @notice Automated referee resolves the dispute based on The Graph ground-truth.
     * Protected against push DoS: if recipient rejects ether, funds enter pull queue.
     */
    function resolveDispute(
        uint256 _jobId,
        bool _sellerWon,
        string calldata _auditLogUri
    ) external override onlyReferee nonReentrant {
        Job storage job = jobs[_jobId];
        require(job.jobId != 0, "ArbiterEscrow: job does not exist");
        require(job.status == JobStatus.DISPUTED, "ArbiterEscrow: job not in DISPUTED state");

        job.auditLogUri = _auditLogUri;
        job.resolvedAt = block.timestamp;
        uint256 funds = job.amount;

        if (_sellerWon) {
            job.status = JobStatus.RESOLVED;
            if (address(reputationRegistry) != address(0)) {
                try reputationRegistry.logFeedback(job.seller, 5, "Dispute resolved in favor of seller") {} catch {}
            }
            _safeTransfer(job.seller, funds);
            emit DisputeResolved(_jobId, true, job.seller, funds, _auditLogUri);
        } else {
            job.status = JobStatus.REFUNDED;
            // Slashing: Severely penalize rogue seller (-50)
            if (address(reputationRegistry) != address(0)) {
                try reputationRegistry.logFeedback(job.seller, -50, "Ground-truth deviation slashed") {} catch {}
            }
            _safeTransfer(job.buyer, funds);
            emit DisputeResolved(_jobId, false, job.buyer, funds, _auditLogUri);
        }
    }

    /**
     * @notice Liveness safety valve: seller can claim payment if challenge window passed without dispute.
     */
    function claimUncontestedDelivery(uint256 _jobId) external override nonReentrant {
        Job storage job = jobs[_jobId];
        require(job.jobId != 0, "ArbiterEscrow: job does not exist");
        require(job.status == JobStatus.DELIVERED, "ArbiterEscrow: job not in DELIVERED state");
        require(
            block.timestamp > job.deliveredAt + job.challengeWindow,
            "ArbiterEscrow: challenge window still active"
        );

        job.status = JobStatus.RESOLVED;
        job.resolvedAt = block.timestamp;
        uint256 payout = job.amount;

        if (address(reputationRegistry) != address(0)) {
            try reputationRegistry.logFeedback(job.seller, 5, "Uncontested delivery auto-settled") {} catch {}
        }

        _safeTransfer(job.seller, payout);

        emit UncontestedSettlementClaimed(_jobId, job.seller, payout);
    }

    /**
     * @notice Timeout safety valve: buyer reclaims deposit if seller never delivers before deadline.
     */
    function claimTimeout(uint256 _jobId) external override nonReentrant {
        Job storage job = jobs[_jobId];
        require(job.jobId != 0, "ArbiterEscrow: job does not exist");
        require(msg.sender == job.buyer, "ArbiterEscrow: only buyer can claim timeout");
        require(job.status == JobStatus.CREATED, "ArbiterEscrow: job not in CREATED state");
        require(block.timestamp > job.deadline, "ArbiterEscrow: deadline not yet passed");

        job.status = JobStatus.REFUNDED;
        job.resolvedAt = block.timestamp;
        uint256 refundAmount = job.amount;

        if (address(reputationRegistry) != address(0)) {
            try reputationRegistry.logFeedback(job.seller, -10, "Job expired without delivery") {} catch {}
        }

        _safeTransfer(job.buyer, refundAmount);

        emit JobTimedOut(_jobId, job.buyer, refundAmount);
    }

    /**
     * @notice Pull mechanism for any funds that could not be directly pushed.
     */
    function withdraw() external override nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "ArbiterEscrow: no pending withdrawal");

        pendingWithdrawals[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "ArbiterEscrow: withdrawal transfer failed");

        emit WithdrawalCompleted(msg.sender, amount);
    }

    /**
     * @dev Internal helper executing push with pull fallback to prevent DoS.
     */
    function _safeTransfer(address payable _recipient, uint256 _amount) internal {
        (bool sent, ) = _recipient.call{value: _amount}("");
        if (!sent) {
            pendingWithdrawals[_recipient] += _amount;
            emit WithdrawalPending(_recipient, _amount);
        }
    }

    function getJob(uint256 _jobId) external view override returns (Job memory) {
        require(jobs[_jobId].jobId != 0, "ArbiterEscrow: job does not exist");
        return jobs[_jobId];
    }

    function getJobCount() external view returns (uint256) {
        return jobCounter;
    }
}
