// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IAIOracle.sol";
import "./PredictionMarket.sol";

contract AIOracle is IAIOracle, Ownable, ReentrancyGuard {
    struct AIResult {
        uint256 predictedOutcome;
        uint256 confidence; // 0-100
        uint256 timestamp;
        bool isSubmitted;
        string evidence;
        address submitter;
    }

    struct AgentReport {
        address agent;
        uint256 outcome;
        uint256 confidence;
        string data;
        uint256 timestamp;
    }

    // State variables
    mapping(address => AIResult) public aiResults; // market => result
    mapping(address => mapping(address => AgentReport)) public agentReports; // market => agent => report
    mapping(address => address[]) public marketAgents; // market => agents[]
    mapping(address => bool) public authorizedAgents;
    mapping(address => uint256) public agentReputation; // 0-1000 reputation score
    
    uint256 public minimumConfidence;
    uint256 public minimumAgents;
    uint256 public consensusThreshold; // Percentage needed for consensus
    
    // Events
    event AIResultSubmitted(
        address indexed market,
        uint256 outcome,
        uint256 confidence,
        address submitter
    );
    
    event AgentReportSubmitted(
        address indexed market,
        address indexed agent,
        uint256 outcome,
        uint256 confidence
    );
    
    event AgentAuthorized(address indexed agent, uint256 reputation);
    event AgentDeauthorized(address indexed agent);
    event ConsensusReached(address indexed market, uint256 outcome, uint256 confidence);

    modifier onlyAuthorizedAgent() {
        require(authorizedAgents[msg.sender], "Not authorized agent");
        _;
    }

    constructor(
        uint256 _minimumConfidence,
        uint256 _minimumAgents,
        uint256 _consensusThreshold
    ) Ownable(msg.sender) {
        minimumConfidence = _minimumConfidence;
        minimumAgents = _minimumAgents;
        consensusThreshold = _consensusThreshold;
    }

    /**
     * @dev Submit AI analysis result for a market
     * @param _market Address of the prediction market
     * @param _predictedOutcome Predicted winning outcome
     * @param _confidence Confidence level (0-100)
     * @param _evidence Supporting evidence/data
     */
    function submitAIResult(
        address _market,
        uint256 _predictedOutcome,
        uint256 _confidence,
        string memory _evidence
    ) external override onlyAuthorizedAgent nonReentrant {
        require(_confidence >= minimumConfidence, "Confidence too low");
        require(_confidence <= 100, "Invalid confidence level");
        
        // Submit agent report
        agentReports[_market][msg.sender] = AgentReport({
            agent: msg.sender,
            outcome: _predictedOutcome,
            confidence: _confidence,
            data: _evidence,
            timestamp: block.timestamp
        });

        // Add agent to market if not already added
        if (!_isAgentInMarket(_market, msg.sender)) {
            marketAgents[_market].push(msg.sender);
        }

        emit AgentReportSubmitted(_market, msg.sender, _predictedOutcome, _confidence);

        // Check if we have enough reports to reach consensus
        _checkConsensus(_market);
    }

    /**
     * @dev Get AI result for a market
     */
    function getAIResult(address _market) 
        external 
        view 
        override 
        returns (uint256 outcome, uint256 confidence, bool isSubmitted) 
    {
        AIResult memory result = aiResults[_market];
        return (result.predictedOutcome, result.confidence, result.isSubmitted);
    }

    /**
     * @dev Check if consensus has been reached and submit final result
     */
    function _checkConsensus(address _market) internal {
        address[] memory agents = marketAgents[_market];
        
        if (agents.length < minimumAgents) {
            return; // Not enough agents yet
        }

        // Calculate consensus
        (uint256 consensusOutcome, uint256 avgConfidence, bool hasConsensus) = 
            _calculateConsensus(_market, agents);

        if (hasConsensus && !aiResults[_market].isSubmitted) {
            // Submit final AI result
            aiResults[_market] = AIResult({
                predictedOutcome: consensusOutcome,
                confidence: avgConfidence,
                timestamp: block.timestamp,
                isSubmitted: true,
                evidence: "AI consensus reached",
                submitter: address(this)
            });

            emit AIResultSubmitted(_market, consensusOutcome, avgConfidence, address(this));
            emit ConsensusReached(_market, consensusOutcome, avgConfidence);

            // Automatically resolve market if it's expired
            _attemptMarketResolution(_market, consensusOutcome);
        }
    }

    /**
     * @dev Calculate consensus from agent reports
     */
    function _calculateConsensus(address _market, address[] memory agents) 
        internal 
        view 
        returns (uint256 outcome, uint256 confidence, bool hasConsensus) 
    {
        if (agents.length == 0) return (0, 0, false);

        uint256 totalWeight = 0;
        uint256 totalConfidence = 0;
        uint256 validReports = 0;

        // Find maximum outcome to determine array size
        uint256 maxOutcome = 0;
        for (uint256 i = 0; i < agents.length; i++) {
            AgentReport memory report = agentReports[_market][agents[i]];
            if (report.timestamp > 0) {
                if (report.outcome > maxOutcome) {
                    maxOutcome = report.outcome;
                }
                validReports++;
            }
        }

        if (validReports == 0) return (0, 0, false);

        // Use arrays for vote counting
        uint256[] memory votes = new uint256[](maxOutcome + 1);
        
        for (uint256 i = 0; i < agents.length; i++) {
            AgentReport memory report = agentReports[_market][agents[i]];
            if (report.timestamp > 0) {
                uint256 agentRep = agentReputation[agents[i]];
                if (agentRep == 0) agentRep = 100; // Default reputation
                
                uint256 weight = (agentRep * report.confidence) / 100;
                votes[report.outcome] += weight;
                totalWeight += weight;
                totalConfidence += report.confidence;
            }
        }

        // Find outcome with most votes
        uint256 maxVotes = 0;
        uint256 winningOutcome = 0;
        
        for (uint256 i = 0; i <= maxOutcome; i++) {
            if (votes[i] > maxVotes) {
                maxVotes = votes[i];
                winningOutcome = i;
            }
        }

        // Check if consensus threshold is met
        uint256 consensusPercentage = (maxVotes * 100) / totalWeight;
        bool consensus = consensusPercentage >= consensusThreshold;
        
        uint256 avgConf = totalConfidence / validReports;
        
        return (winningOutcome, avgConf, consensus);
    }

    /**
     * @dev Attempt to resolve market with AI result
     */
    function _attemptMarketResolution(address _market, uint256 _outcome) internal {
        try PredictionMarket(_market).resolveMarket(_outcome, "AI Oracle Resolution") {
            // Market resolved successfully
        } catch {
            // Market resolution failed, possibly not expired yet
        }
    }

    /**
     * @dev Check if agent is already in market's agent list
     */
    function _isAgentInMarket(address _market, address _agent) internal view returns (bool) {
        address[] memory agents = marketAgents[_market];
        for (uint256 i = 0; i < agents.length; i++) {
            if (agents[i] == _agent) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Authorize an AI agent
     */
    function authorizeAgent(address _agent, uint256 _reputation) external onlyOwner {
        require(_agent != address(0), "Invalid agent address");
        require(_reputation <= 1000, "Invalid reputation score");
        
        authorizedAgents[_agent] = true;
        agentReputation[_agent] = _reputation;
        
        emit AgentAuthorized(_agent, _reputation);
    }

    /**
     * @dev Deauthorize an AI agent
     */
    function deauthorizeAgent(address _agent) external onlyOwner {
        authorizedAgents[_agent] = false;
        agentReputation[_agent] = 0;
        
        emit AgentDeauthorized(_agent);
    }

    /**
     * @dev Update agent reputation based on performance
     */
    function updateAgentReputation(address _agent, uint256 _newReputation) external onlyOwner {
        require(authorizedAgents[_agent], "Agent not authorized");
        require(_newReputation <= 1000, "Invalid reputation score");
        
        agentReputation[_agent] = _newReputation;
    }

    /**
     * @dev Update oracle parameters
     */
    function updateParameters(
        uint256 _minimumConfidence,
        uint256 _minimumAgents,
        uint256 _consensusThreshold
    ) external onlyOwner {
        require(_minimumConfidence <= 100, "Invalid confidence");
        require(_consensusThreshold <= 100, "Invalid threshold");
        
        minimumConfidence = _minimumConfidence;
        minimumAgents = _minimumAgents;
        consensusThreshold = _consensusThreshold;
    }

    /**
     * @dev Get market agents
     */
    function getMarketAgents(address _market) external view returns (address[] memory) {
        return marketAgents[_market];
    }

    /**
     * @dev Get agent report for market
     */
    function getAgentReport(address _market, address _agent) 
        external 
        view 
        returns (AgentReport memory) 
    {
        return agentReports[_market][_agent];
    }

    /**
     * @dev Force consensus calculation (for testing/emergency)
     */
    function forceConsensusCheck(address _market) external onlyOwner {
        _checkConsensus(_market);
    }

    /**
     * @dev Manual result submission (fallback)
     */
    function submitManualResult(
        address _market,
        uint256 _outcome,
        uint256 _confidence,
        string memory _evidence
    ) external onlyOwner {
        require(!aiResults[_market].isSubmitted, "Result already submitted");
        
        aiResults[_market] = AIResult({
            predictedOutcome: _outcome,
            confidence: _confidence,
            timestamp: block.timestamp,
            isSubmitted: true,
            evidence: _evidence,
            submitter: msg.sender
        });

        emit AIResultSubmitted(_market, _outcome, _confidence, msg.sender);
        
        _attemptMarketResolution(_market, _outcome);
    }
}