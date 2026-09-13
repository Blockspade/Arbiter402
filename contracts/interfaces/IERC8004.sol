// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IERC8004
 * @notice Standard interface for ERC-8004 Autonomous Agent Reputation & Scoring.
 */
interface IERC8004 {
    event FeedbackLogged(
        address indexed agent,
        address indexed reporter,
        int256 scoreDelta,
        int256 newScore,
        string reason
    );

    event AgentRegistered(
        address indexed agent,
        string agentMetadataUri,
        int256 initialScore
    );

    /**
     * @notice Fetch reputation metrics for an agent.
     * @param agent The agent wallet address.
     * @return score Current trust score (default 100).
     * @return totalJobs Total number of completed tasks.
     * @return slashCount Total number of malicious/defective rulings.
     */
    function getReputation(address agent)
        external
        view
        returns (
            int256 score,
            uint256 totalJobs,
            uint256 slashCount
        );

    /**
     * @notice Log reputation feedback for an agent.
     * @param agent The agent receiving feedback.
     * @param scoreDelta Points to add or subtract.
     * @param reason Description of the feedback / ground-truth proof.
     */
    function logFeedback(
        address agent,
        int256 scoreDelta,
        string calldata reason
    ) external;
}
