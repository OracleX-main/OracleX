// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IAIOracle.sol";

contract PredictionMarket is ReentrancyGuard, Pausable {
    enum MarketStatus { Active, Resolved, Disputed, Cancelled }
    enum OracleType { AI, Manual, Hybrid }

    struct Bet {
        uint256 amount;
        uint256 outcome;
        uint256 timestamp;
        bool claimed;
    }

    struct Outcome {
        string name;
        uint256 totalStaked;
        uint256 betCount;
    }

    // State variables
    string public title;
    string public description;
    Outcome[] public outcomes;
    uint256 public expiryTime;
    address public creator;
    address public factory;
    address public oracleAddress;
    OracleType public oracleType;
    MarketStatus public status;
    
    uint256 public totalVolume;
    uint256 public winningOutcome;
    uint256 public resolutionTime;
    uint256 public platformFeeRate; // Basis points (e.g., 250 = 2.5%)
    
    mapping(address => Bet[]) public userBets;
    mapping(address => uint256) public userTotalStaked;
    mapping(uint256 => uint256) public outcomeStaked;
    
    address[] public participants;
    mapping(address => bool) public hasParticipated;

    // Events
    event BetPlaced(
        address indexed user,
        uint256 indexed outcome,
        uint256 amount,
        uint256 timestamp
    );
    
    event MarketResolved(
        uint256 indexed winningOutcome,
        uint256 timestamp,
        string resolution
    );
    
    event RewardClaimed(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    event MarketDisputed(
        address indexed disputer,
        uint256 timestamp,
        string reason
    );

    event MarketCancelled(uint256 timestamp, string reason);

    modifier onlyCreator() {
        require(msg.sender == creator, "Only market creator allowed");
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory allowed");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Only oracle allowed");
        _;
    }

    modifier marketActive() {
        require(status == MarketStatus.Active, "Market not active");
        require(block.timestamp < expiryTime, "Market expired");
        _;
    }

    modifier marketResolved() {
        require(status == MarketStatus.Resolved, "Market not resolved");
        _;
    }

    constructor(
        string memory _title,
        string memory _description,
        string[] memory _outcomes,
        uint256 _expiryTime,
        address _creator,
        address _oracleAddress,
        uint8 _oracleType,
        address _factory
    ) {
        require(_outcomes.length >= 2, "Need at least 2 outcomes");
        require(_expiryTime > block.timestamp, "Expiry must be in future");
        
        title = _title;
        description = _description;
        expiryTime = _expiryTime;
        creator = _creator;
        oracleAddress = _oracleAddress;
        oracleType = OracleType(_oracleType);
        factory = _factory;
        status = MarketStatus.Active;
        platformFeeRate = 250; // 2.5% default fee
        
        // Initialize outcomes
        for (uint256 i = 0; i < _outcomes.length; i++) {
            outcomes.push(Outcome({
                name: _outcomes[i],
                totalStaked: 0,
                betCount: 0
            }));
        }
    }

    /**
     * @dev Place a bet on a specific outcome
     * @param _outcome Index of the outcome to bet on
     */
    function placeBet(uint256 _outcome) 
        external 
        payable 
        nonReentrant 
        marketActive 
        whenNotPaused 
    {
        require(_outcome < outcomes.length, "Invalid outcome");
        require(msg.value > 0, "Bet amount must be positive");
        
        // Record bet
        userBets[msg.sender].push(Bet({
            amount: msg.value,
            outcome: _outcome,
            timestamp: block.timestamp,
            claimed: false
        }));

        // Update tracking variables
        outcomes[_outcome].totalStaked += msg.value;
        outcomes[_outcome].betCount++;
        outcomeStaked[_outcome] += msg.value;
        userTotalStaked[msg.sender] += msg.value;
        totalVolume += msg.value;

        // Track unique participants
        if (!hasParticipated[msg.sender]) {
            participants.push(msg.sender);
            hasParticipated[msg.sender] = true;
        }

        emit BetPlaced(msg.sender, _outcome, msg.value, block.timestamp);
    }

    /**
     * @dev Resolve market with winning outcome
     * @param _winningOutcome Index of the winning outcome
     * @param _resolution Description of resolution
     */
    function resolveMarket(uint256 _winningOutcome, string memory _resolution) 
        external 
        onlyOracle 
        nonReentrant 
    {
        require(status == MarketStatus.Active, "Market not active");
        require(block.timestamp >= expiryTime, "Market not expired yet");
        require(_winningOutcome < outcomes.length, "Invalid winning outcome");
        
        status = MarketStatus.Resolved;
        winningOutcome = _winningOutcome;
        resolutionTime = block.timestamp;
        
        emit MarketResolved(_winningOutcome, block.timestamp, _resolution);
    }

    /**
     * @dev Claim rewards for winning bets
     */
    function claimReward() external nonReentrant marketResolved {
        require(userBets[msg.sender].length > 0, "No bets found");
        
        uint256 totalReward = calculateUserReward(msg.sender);
        require(totalReward > 0, "No rewards to claim");
        
        // Mark bets as claimed
        for (uint256 i = 0; i < userBets[msg.sender].length; i++) {
            if (userBets[msg.sender][i].outcome == winningOutcome && 
                !userBets[msg.sender][i].claimed) {
                userBets[msg.sender][i].claimed = true;
            }
        }
        
        // Calculate platform fee
        uint256 platformFee = (totalReward * platformFeeRate) / 10000;
        uint256 userReward = totalReward - platformFee;
        
        // Transfer rewards
        (bool success, ) = payable(msg.sender).call{value: userReward}("");
        require(success, "Reward transfer failed");
        
        // Transfer platform fee to factory
        if (platformFee > 0) {
            (bool feeSuccess, ) = payable(factory).call{value: platformFee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        emit RewardClaimed(msg.sender, userReward, block.timestamp);
    }

    /**
     * @dev Calculate potential reward for a user
     */
    function calculateUserReward(address _user) public view returns (uint256) {
        if (status != MarketStatus.Resolved) return 0;
        
        uint256 userWinningStake = 0;
        
        // Calculate user's winning stakes
        for (uint256 i = 0; i < userBets[_user].length; i++) {
            Bet memory bet = userBets[_user][i];
            if (bet.outcome == winningOutcome && !bet.claimed) {
                userWinningStake += bet.amount;
            }
        }
        
        if (userWinningStake == 0) return 0;
        
        uint256 totalWinningStake = outcomes[winningOutcome].totalStaked;
        if (totalWinningStake == 0) return 0;
        
        // Calculate proportional share of total pool
        return (userWinningStake * totalVolume) / totalWinningStake;
    }

    /**
     * @dev Get market information
     */
    function getMarketInfo() external view returns (
        string memory _title,
        string memory _description,
        uint256 _totalVolume,
        uint256 _expiryTime,
        MarketStatus _status,
        uint256 _participantCount,
        uint256 _outcomeCount
    ) {
        return (
            title,
            description,
            totalVolume,
            expiryTime,
            status,
            participants.length,
            outcomes.length
        );
    }

    /**
     * @dev Get all outcomes
     */
    function getOutcomes() external view returns (Outcome[] memory) {
        return outcomes;
    }

    /**
     * @dev Get user's bets
     */
    function getUserBets(address _user) external view returns (Bet[] memory) {
        return userBets[_user];
    }

    /**
     * @dev Get market odds for each outcome
     */
    function getOdds() external view returns (uint256[] memory) {
        uint256[] memory odds = new uint256[](outcomes.length);
        
        if (totalVolume == 0) {
            // Equal odds if no bets placed
            for (uint256 i = 0; i < outcomes.length; i++) {
                odds[i] = 10000 / outcomes.length; // Basis points
            }
        } else {
            for (uint256 i = 0; i < outcomes.length; i++) {
                odds[i] = (outcomes[i].totalStaked * 10000) / totalVolume;
            }
        }
        
        return odds;
    }

    /**
     * @dev Emergency pause (only creator or factory)
     */
    function pause() external {
        require(msg.sender == creator || msg.sender == factory, "Unauthorized");
        _pause();
    }

    /**
     * @dev Unpause (only creator or factory)
     */
    function unpause() external {
        require(msg.sender == creator || msg.sender == factory, "Unauthorized");
        _unpause();
    }

    /**
     * @dev Cancel market and refund all participants
     */
    function cancelMarket(string memory _reason) external onlyFactory {
        require(status == MarketStatus.Active, "Market not active");
        
        status = MarketStatus.Cancelled;
        
        // Refund all participants
        for (uint256 i = 0; i < participants.length; i++) {
            address participant = participants[i];
            uint256 totalStaked = userTotalStaked[participant];
            
            if (totalStaked > 0) {
                userTotalStaked[participant] = 0;
                (bool success, ) = payable(participant).call{value: totalStaked}("");
                require(success, "Refund failed");
            }
        }
        
        emit MarketCancelled(block.timestamp, _reason);
    }

    /**
     * @dev Dispute market resolution
     */
    function disputeMarket(string memory _reason) external payable {
        require(status == MarketStatus.Resolved, "Market not resolved");
        require(block.timestamp <= resolutionTime + 7 days, "Dispute period expired");
        require(msg.value >= 0.1 ether, "Insufficient dispute bond");
        
        status = MarketStatus.Disputed;
        
        emit MarketDisputed(msg.sender, block.timestamp, _reason);
    }

    /**
     * @dev Get participants list
     */
    function getParticipants() external view returns (address[] memory) {
        return participants;
    }

    /**
     * @dev Check if user has unclaimed rewards
     */
    function hasUnclaimedRewards(address _user) external view returns (bool) {
        if (status != MarketStatus.Resolved) return false;
        return calculateUserReward(_user) > 0;
    }
}