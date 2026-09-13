// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IArbiterEscrow
 * @notice Interface for Arbiter402 Sub-Second Conditional Micro-Escrow.
 */
interface IArbiterEscrow {
    enum JobStatus {
        CREATED,
        DELIVERED,
        DISPUTED,
        RESOLVED,
        REFUNDED
    }

    struct Job {
        uint256 jobId;
        address payable buyer;
        address payable seller;
        uint256 amount;
        bytes32 specHash;
        bytes32 resultHash;
        string deliveryUri;
        uint256 deadline;
        JobStatus status;
        string disputeReason;
        string auditLogUri;
        uint256 createdAt;
        uint256 deliveredAt;
        uint256 resolvedAt;
    }

    event JobCreated(
        uint256 indexed jobId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        bytes32 specHash,
        uint256 deadline
    );

    event DeliverySubmitted(
        uint256 indexed jobId,
        address indexed seller,
        bytes32 resultHash,
        string deliveryUri
    );

    event JobConfirmed(
        uint256 indexed jobId,
        address indexed seller,
        uint256 amount
    );

    event DisputeRaised(
        uint256 indexed jobId,
        address indexed buyer,
        string reason
    );

    event DisputeResolved(
        uint256 indexed jobId,
        bool sellerWon,
        address indexed recipient,
        uint256 amount,
        string auditLogUri
    );

    event JobTimedOut(
        uint256 indexed jobId,
        address indexed buyer,
        uint256 refundAmount
    );

    function createJob(
        address payable seller,
        bytes32 specHash,
        uint256 duration
    ) external payable returns (uint256 jobId);

    function submitDelivery(
        uint256 jobId,
        bytes32 resultHash,
        string calldata deliveryUri
    ) external;

    function confirmDelivery(uint256 jobId) external;

    function raiseDispute(uint256 jobId, string calldata disputeReason) external;

    function resolveDispute(
        uint256 jobId,
        bool sellerWon,
        string calldata auditLogUri
    ) external;

    function claimTimeout(uint256 jobId) external;

    function getJob(uint256 jobId) external view returns (Job memory);
}
