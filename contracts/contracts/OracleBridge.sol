// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ORXToken.sol";

/**
 * @title OracleBridge
 * @dev Bridge between AI oracles and smart contracts
 */
contract OracleBridge is Ownable, ReentrancyGuard {
    ORXToken public immutable orxToken;
    
    struct Oracle {
        address oracle;
        bool isActive;
        uint256 stake;
        uint256 reputation;
        uint256 totalResolutions;
        uint256 correctResolutions;
    }
    
    struct Resolution {
        uint256 marketId;
        bytes32 outcome;
        uint256 confidence;
        uint256 timestamp;
        bool disputed;
        bool finalized;
    }
    
    mapping(address => Oracle) public oracles;
    mapping(uint256 => Resolution) public resolutions;
    mapping(uint256 => mapping(address => bytes32)) public oracleVotes;
    mapping(uint256 => address[]) public marketOracles;
    
    address[] public registeredOracles;
    
    uint256 public constant MIN_STAKE = 10000 * 10**18; // 10,000 ORX
    uint256 public constant MIN_ORACLES = 3;
    uint256 public constant CONSENSUS_THRESHOLD = 60; // 60%
    
    event OracleRegistered(address indexed oracle, uint256 stake);
    event OracleDeactivated(address indexed oracle);
    event ResolutionSubmitted(uint256 indexed marketId, address indexed oracle, bytes32 outcome);
    event ResolutionFinalized(uint256 indexed marketId, bytes32 outcome);
    event DisputeRaised(uint256 indexed marketId, address indexed disputer);
    
    constructor(address _orxToken) Ownable(msg.sender) {
        orxToken = ORXToken(_orxToken);
    }
    
    /**
     * @dev Register as an oracle
     */
    function registerOracle(uint256 stakeAmount) external {
        require(stakeAmount >= MIN_STAKE, "Insufficient stake");
        require(!oracles[msg.sender].isActive, "Already registered");
        
        orxToken.transferFrom(msg.sender, address(this), stakeAmount);
        
        oracles[msg.sender] = Oracle({
            oracle: msg.sender,
            isActive: true,
            stake: stakeAmount,
            reputation: 100, // Starting reputation
            totalResolutions: 0,
            correctResolutions: 0
        });
        
        registeredOracles.push(msg.sender);
        
        emit OracleRegistered(msg.sender, stakeAmount);
    }
    
    /**
     * @dev Deactivate oracle (emergency)
     */
    function deactivateOracle(address oracle) external onlyOwner {
        require(oracles[oracle].isActive, "Oracle not active");
        oracles[oracle].isActive = false;
        emit OracleDeactivated(oracle);
    }
    
    /**
     * @dev Submit resolution for a market
     */
    function submitResolution(
        uint256 marketId,
        bytes32 outcome,
        uint256 confidence
    ) external {
        require(oracles[msg.sender].isActive, "Not an active oracle");
        require(confidence <= 100, "Invalid confidence");
        require(oracleVotes[marketId][msg.sender] == 0, "Already voted");
        
        oracleVotes[marketId][msg.sender] = outcome;
        marketOracles[marketId].push(msg.sender);
        
        emit ResolutionSubmitted(marketId, msg.sender, outcome);
        
        // Check if we have enough votes to finalize
        if (marketOracles[marketId].length >= MIN_ORACLES) {
            _tryFinalizeResolution(marketId);
        }
    }
    
    /**
     * @dev Try to finalize resolution based on consensus
     */
    function _tryFinalizeResolution(uint256 marketId) internal {
        address[] memory voters = marketOracles[marketId];
        mapping(bytes32 => uint256) storage votes;
        bytes32[] memory outcomes = new bytes32[](voters.length);
        uint256 uniqueCount = 0;
        
        // Count votes for each outcome
        for (uint256 i = 0; i < voters.length; i++) {
            bytes32 vote = oracleVotes[marketId][voters[i]];
            votes[vote] += oracles[voters[i]].reputation;
            
            // Track unique outcomes
            bool found = false;
            for (uint256 j = 0; j < uniqueCount; j++) {
                if (outcomes[j] == vote) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                outcomes[uniqueCount] = vote;
                uniqueCount++;
            }
        }
        
        // Find winning outcome
        bytes32 winningOutcome;
        uint256 maxVotes = 0;
        uint256 totalVotes = 0;
        
        for (uint256 i = 0; i < uniqueCount; i++) {
            uint256 voteCount = votes[outcomes[i]];
            totalVotes += voteCount;
            if (voteCount > maxVotes) {
                maxVotes = voteCount;
                winningOutcome = outcomes[i];
            }
        }
        
        // Check if consensus reached
        if ((maxVotes * 100) / totalVotes >= CONSENSUS_THRESHOLD) {
            resolutions[marketId] = Resolution({
                marketId: marketId,
                outcome: winningOutcome,
                confidence: (maxVotes * 100) / totalVotes,
                timestamp: block.timestamp,
                disputed: false,
                finalized: true
            });
            
            // Update oracle reputations
            _updateReputations(marketId, winningOutcome);
            
            emit ResolutionFinalized(marketId, winningOutcome);
        }
    }
    
    /**
     * @dev Update oracle reputations based on correctness
     */
    function _updateReputations(uint256 marketId, bytes32 correctOutcome) internal {
        address[] memory voters = marketOracles[marketId];
        
        for (uint256 i = 0; i < voters.length; i++) {
            address oracle = voters[i];
            oracles[oracle].totalResolutions++;
            
            if (oracleVotes[marketId][oracle] == correctOutcome) {
                oracles[oracle].correctResolutions++;
                // Increase reputation for correct vote
                if (oracles[oracle].reputation < 200) {
                    oracles[oracle].reputation += 1;
                }
            } else {
                // Decrease reputation for incorrect vote
                if (oracles[oracle].reputation > 50) {
                    oracles[oracle].reputation -= 2;
                }
            }
        }
    }
    
    /**
     * @dev Raise dispute for a resolution
     */
    function raiseDispute(uint256 marketId) external {
        require(resolutions[marketId].finalized, "Resolution not finalized");
        require(!resolutions[marketId].disputed, "Already disputed");
        require(orxToken.balanceOf(msg.sender) >= MIN_STAKE, "Insufficient stake to dispute");
        
        resolutions[marketId].disputed = true;
        
        emit DisputeRaised(marketId, msg.sender);
    }
    
    /**
     * @dev Get resolution for a market
     */
    function getResolution(uint256 marketId) external view returns (Resolution memory) {
        return resolutions[marketId];
    }
    
    /**
     * @dev Get oracle info
     */
    function getOracle(address oracle) external view returns (Oracle memory) {
        return oracles[oracle];
    }
    
    /**
     * @dev Get active oracles count
     */
    function getActiveOraclesCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < registeredOracles.length; i++) {
            if (oracles[registeredOracles[i]].isActive) {
                count++;
            }
        }
        return count;
    }
}