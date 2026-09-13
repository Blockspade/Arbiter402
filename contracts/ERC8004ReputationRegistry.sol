// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IERC8004.sol";

/**
 * @title ERC8004ReputationRegistry
 * @notice Onchain Trust and Reputation Registry for Autonomous AI Agents.
 * Conforms to the ERC-8004 standard for agent reputation scoring and slashing.
 */
contract ERC8004ReputationRegistry is IERC8004 {
    address public owner;

    struct AgentProfile {
        int256 score;
        uint256 totalJobs;
        uint256 slashCount;
        bool exists;
        string metadataUri;
    }

    mapping(address => AgentProfile) private profiles;
    mapping(address => bool) public authorizedReporters;

    int256 public constant INITIAL_TRUST_SCORE = 100;
    int256 public constant MIN_TRUST_SCORE = -500;
    int256 public constant MAX_TRUST_SCORE = 500;

    modifier onlyOwner() {
        require(msg.sender == owner, "ERC8004: caller is not the owner");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedReporters[msg.sender],
            "ERC8004: caller not authorized to report feedback"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedReporters[msg.sender] = true;
    }

    function setAuthorizedReporter(address reporter, bool authorized) external onlyOwner {
        require(reporter != address(0), "ERC8004: invalid reporter address");
        authorizedReporters[reporter] = authorized;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ERC8004: invalid owner");
        owner = newOwner;
    }

    function registerAgent(address agent, string calldata metadataUri) external {
        require(agent != address(0), "ERC8004: zero address");
        if (!profiles[agent].exists) {
            profiles[agent] = AgentProfile({
                score: INITIAL_TRUST_SCORE,
                totalJobs: 0,
                slashCount: 0,
                exists: true,
                metadataUri: metadataUri
            });
            emit AgentRegistered(agent, metadataUri, INITIAL_TRUST_SCORE);
        } else {
            profiles[agent].metadataUri = metadataUri;
        }
    }

    function logFeedback(
        address agent,
        int256 scoreDelta,
        string calldata reason
    ) external override onlyAuthorized {
        require(agent != address(0), "ERC8004: invalid agent address");

        if (!profiles[agent].exists) {
            profiles[agent] = AgentProfile({
                score: INITIAL_TRUST_SCORE,
                totalJobs: 0,
                slashCount: 0,
                exists: true,
                metadataUri: ""
            });
            emit AgentRegistered(agent, "", INITIAL_TRUST_SCORE);
        }

        AgentProfile storage profile = profiles[agent];
        int256 newScore = profile.score + scoreDelta;

        if (newScore < MIN_TRUST_SCORE) {
            newScore = MIN_TRUST_SCORE;
        } else if (newScore > MAX_TRUST_SCORE) {
            newScore = MAX_TRUST_SCORE;
        }

        profile.score = newScore;
        profile.totalJobs += 1;

        if (scoreDelta < 0) {
            profile.slashCount += 1;
        }

        emit FeedbackLogged(agent, msg.sender, scoreDelta, newScore, reason);
    }

    function getReputation(address agent)
        external
        view
        override
        returns (
            int256 score,
            uint256 totalJobs,
            uint256 slashCount
        )
    {
        if (!profiles[agent].exists) {
            return (INITIAL_TRUST_SCORE, 0, 0);
        }
        AgentProfile storage profile = profiles[agent];
        return (profile.score, profile.totalJobs, profile.slashCount);
    }

    function getAgentMetadata(address agent) external view returns (string memory) {
        return profiles[agent].metadataUri;
    }
}
