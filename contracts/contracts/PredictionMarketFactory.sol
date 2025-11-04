// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PredictionMarket.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PredictionMarketFactory is Ownable, ReentrancyGuard {
    struct MarketInfo {
        address marketAddress;
        string title;
        string description;
        uint256 createdAt;
        uint256 expiryTime;
        bool isActive;
        address creator;
        string category;
    }

    // State variables
    mapping(uint256 => MarketInfo) public markets;
    mapping(address => uint256[]) public userMarkets;
    mapping(string => uint256[]) public categoryMarkets;
    
    uint256 public marketCounter;
    uint256 public marketCreationFee;
    address public oracleAddress;
    address public stakingContract;
    
    // Events
    event MarketCreated(
        uint256 indexed marketId,
        address indexed marketAddress,
        address indexed creator,
        string title,
        string category,
        uint256 expiryTime
    );
    
    event MarketStatusChanged(uint256 indexed marketId, bool isActive);
    event FactoryConfigUpdated(uint256 marketCreationFee, address oracleAddress);

    constructor(
        uint256 _marketCreationFee,
        address _oracleAddress
    ) Ownable(msg.sender) {
        marketCreationFee = _marketCreationFee;
        oracleAddress = _oracleAddress;
        marketCounter = 0;
    }

    /**
     * @dev Creates a new prediction market
     * @param _title Market title
     * @param _description Market description
     * @param _outcomes Array of possible outcomes
     * @param _expiryTime Market expiry timestamp
     * @param _category Market category
     * @param _oracleType Type of oracle resolution (0: AI, 1: Manual, 2: Hybrid)
     */
    function createMarket(
        string memory _title,
        string memory _description,
        string[] memory _outcomes,
        uint256 _expiryTime,
        string memory _category,
        uint8 _oracleType
    ) external payable nonReentrant returns (address) {
        require(msg.value >= marketCreationFee, "Insufficient creation fee");
        require(_expiryTime > block.timestamp, "Expiry time must be in future");
        require(_outcomes.length >= 2, "Must have at least 2 outcomes");
        require(bytes(_title).length > 0, "Title cannot be empty");

        // Deploy new PredictionMarket contract
        PredictionMarket newMarket = new PredictionMarket(
            _title,
            _description,
            _outcomes,
            _expiryTime,
            msg.sender,
            oracleAddress,
            _oracleType,
            address(this)
        );

        uint256 marketId = marketCounter++;
        
        // Store market info
        markets[marketId] = MarketInfo({
            marketAddress: address(newMarket),
            title: _title,
            description: _description,
            createdAt: block.timestamp,
            expiryTime: _expiryTime,
            isActive: true,
            creator: msg.sender,
            category: _category
        });

        // Update mappings
        userMarkets[msg.sender].push(marketId);
        categoryMarkets[_category].push(marketId);

        emit MarketCreated(
            marketId,
            address(newMarket),
            msg.sender,
            _title,
            _category,
            _expiryTime
        );

        return address(newMarket);
    }

    /**
     * @dev Get market information by ID
     */
    function getMarket(uint256 _marketId) external view returns (MarketInfo memory) {
        return markets[_marketId];
    }

    /**
     * @dev Get all markets (paginated)
     */
    function getMarkets(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (MarketInfo[] memory) 
    {
        require(_offset < marketCounter, "Offset exceeds market count");
        
        uint256 end = _offset + _limit;
        if (end > marketCounter) {
            end = marketCounter;
        }
        
        MarketInfo[] memory result = new MarketInfo[](end - _offset);
        
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = markets[i];
        }
        
        return result;
    }

    /**
     * @dev Get markets by category
     */
    function getMarketsByCategory(string memory _category) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return categoryMarkets[_category];
    }

    /**
     * @dev Get markets created by user
     */
    function getUserMarkets(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userMarkets[_user];
    }

    /**
     * @dev Get active markets only
     */
    function getActiveMarkets(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (MarketInfo[] memory) 
    {
        // Count active markets first
        uint256 activeCount = 0;
        for (uint256 i = 0; i < marketCounter; i++) {
            if (markets[i].isActive) {
                activeCount++;
            }
        }

        require(_offset < activeCount, "Offset exceeds active market count");
        
        uint256 end = _offset + _limit;
        if (end > activeCount) {
            end = activeCount;
        }
        
        MarketInfo[] memory result = new MarketInfo[](end - _offset);
        uint256 resultIndex = 0;
        uint256 activeIndex = 0;
        
        for (uint256 i = 0; i < marketCounter && resultIndex < (end - _offset); i++) {
            if (markets[i].isActive) {
                if (activeIndex >= _offset) {
                    result[resultIndex] = markets[i];
                    resultIndex++;
                }
                activeIndex++;
            }
        }
        
        return result;
    }

    /**
     * @dev Toggle market active status (only owner)
     */
    function toggleMarketStatus(uint256 _marketId) external onlyOwner {
        require(_marketId < marketCounter, "Market does not exist");
        
        markets[_marketId].isActive = !markets[_marketId].isActive;
        emit MarketStatusChanged(_marketId, markets[_marketId].isActive);
    }

    /**
     * @dev Update factory configuration (only owner)
     */
    function updateConfig(
        uint256 _marketCreationFee,
        address _oracleAddress
    ) external onlyOwner {
        marketCreationFee = _marketCreationFee;
        oracleAddress = _oracleAddress;
        
        emit FactoryConfigUpdated(_marketCreationFee, _oracleAddress);
    }

    /**
     * @dev Set staking contract address (only owner)
     */
    function setStakingContract(address _stakingContract) external onlyOwner {
        stakingContract = _stakingContract;
    }

    /**
     * @dev Withdraw accumulated fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Fee withdrawal failed");
    }

    /**
     * @dev Get total market count
     */
    function getTotalMarkets() external view returns (uint256) {
        return marketCounter;
    }

    /**
     * @dev Check if market exists
     */
    function marketExists(uint256 _marketId) external view returns (bool) {
        return _marketId < marketCounter;
    }
}