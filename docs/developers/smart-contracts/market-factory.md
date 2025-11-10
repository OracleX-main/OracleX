# Market Factory Contract

The Market Factory contract is responsible for creating and managing all prediction markets on OracleX.

##  Contract Details

| Property | Value |
|----------|-------|
| **Name** | OracleXMarketFactory |
| **Address** | `0x273C8Dde70897069BeC84394e235feF17e7c5E1b` |
| **Network** | BNB Chain Testnet (97) |
| **Upgradeable** | Yes (UUPS Proxy) |
| **Admin** | Governance DAO |

##  Core Functions

### Market Creation

#### `createMarket`

Create a new prediction market.

```solidity
function createMarket(
    string memory question,
    string memory category,
    uint256 endTime,
    string memory resolutionSource,
    string[] memory outcomes
) external payable returns (uint256 marketId)
```

**Parameters:**
- `question` - Market question (max 500 chars)
- `category` - Category slug (sports, crypto, etc.)
- `endTime` - Unix timestamp when betting closes
- `resolutionSource` - URL or description of resolution source
- `outcomes` - Array of outcome names (2-6 outcomes)

**Requirements:**
- Caller must stake 1,000 ORX (sent as value)
- End time must be at least 24 hours in future
- Question must be unique
- Outcomes must be 2-6 items

**Returns:**
- `marketId` - Unique identifier for the market

**Events Emitted:**
- `MarketCreated(uint256 marketId, address creator, string question)`

**Example:**
```typescript
const tx = await marketFactory.createMarket(
  "Will Bitcoin reach $100,000 in 2025?",
  "crypto",
  1735689600, // Dec 31, 2025 23:59:59 UTC
  "https://www.coingecko.com/en/coins/bitcoin",
  ["YES", "NO"],
  { value: ethers.parseEther("1000") }
);

const receipt = await tx.wait();
const marketId = receipt.logs[0].args.marketId;
console.log('Market created:', marketId);
```

**Gas Estimate:** ~350,000

### Market Information

#### `getMarket`

Get detailed market information.

```solidity
function getMarket(uint256 marketId) 
    external 
    view 
    returns (Market memory)
```

**Returns:**
```solidity
struct Market {
    uint256 id;
    string question;
    string category;
    address creator;
    uint256 endTime;
    uint256 createdAt;
    string resolutionSource;
    MarketStatus status;
    uint256 totalVolume;
    Outcome[] outcomes;
}
```

**Example:**
```typescript
const market = await marketFactory.getMarket(1);
console.log('Question:', market.question);
console.log('Creator:', market.creator);
console.log('Status:', market.status);
console.log('Volume:', ethers.formatEther(market.totalVolume));
```

#### `getMarkets`

Get multiple markets with pagination.

```solidity
function getMarkets(
    uint256 offset,
    uint256 limit
) external view returns (Market[] memory)
```

**Parameters:**
- `offset` - Starting index
- `limit` - Number of markets to return (max 100)

**Example:**
```typescript
// Get first 20 markets
const markets = await marketFactory.getMarkets(0, 20);

markets.forEach(market => {
  console.log(`${market.id}: ${market.question}`);
});
```

#### `getMarketsByCategory`

Filter markets by category.

```solidity
function getMarketsByCategory(
    string memory category,
    uint256 offset,
    uint256 limit
) external view returns (Market[] memory)
```

**Example:**
```typescript
// Get crypto markets
const cryptoMarkets = await marketFactory.getMarketsByCategory(
  "crypto",
  0,
  20
);
```

#### `getMarketsByStatus`

Filter markets by status.

```solidity
function getMarketsByStatus(
    MarketStatus status,
    uint256 offset,
    uint256 limit
) external view returns (Market[] memory)
```

**Status Enum:**
```solidity
enum MarketStatus {
    Active,      // 0 - Accepting predictions
    Pending,     // 1 - Ended, awaiting resolution
    Resolved,    // 2 - Outcome determined
    Disputed,    // 3 - Under dispute
    Cancelled    // 4 - Cancelled/Invalid
}
```

**Example:**
```typescript
// Get active markets
const activeMarkets = await marketFactory.getMarketsByStatus(0, 0, 50);
```

### Making Predictions

#### `predict`

Place a prediction on a market outcome.

```solidity
function predict(
    uint256 marketId,
    uint256 outcomeId,
    uint256 amount
) external returns (uint256 predictionId)
```

**Parameters:**
- `marketId` - ID of the market
- `outcomeId` - Index of the outcome (0, 1, 2, etc.)
- `amount` - Amount of ORX to stake (in wei)

**Requirements:**
- Market must be Active
- Current time < market.endTime
- Amount >= minimum stake (10 ORX)
- Caller must have sufficient ORX and approval

**Returns:**
- `predictionId` - Unique identifier for the prediction

**Events Emitted:**
- `PredictionMade(uint256 marketId, address predictor, uint256 outcomeId, uint256 amount)`

**Example:**
```typescript
// First approve ORX spending
await orxToken.approve(
  marketFactoryAddress,
  ethers.parseEther("1000")
);

// Make prediction
const tx = await marketFactory.predict(
  1, // marketId
  0, // outcomeId (YES)
  ethers.parseEther("1000") // 1,000 ORX
);

await tx.wait();
console.log('Prediction placed!');
```

**Gas Estimate:** ~120,000

#### `getPrediction`

Get prediction details.

```solidity
function getPrediction(uint256 predictionId)
    external
    view
    returns (Prediction memory)
```

**Returns:**
```solidity
struct Prediction {
    uint256 id;
    uint256 marketId;
    uint256 outcomeId;
    address predictor;
    uint256 amount;
    uint256 timestamp;
    bool claimed;
    uint256 payout;
}
```

**Example:**
```typescript
const prediction = await marketFactory.getPrediction(123);
console.log('Staked:', ethers.formatEther(prediction.amount), 'ORX');
console.log('Outcome:', prediction.outcomeId);
console.log('Claimed:', prediction.claimed);
```

#### `getUserPredictions`

Get all predictions by a user.

```solidity
function getUserPredictions(address user)
    external
    view
    returns (Prediction[] memory)
```

**Example:**
```typescript
const myPredictions = await marketFactory.getUserPredictions(
  userAddress
);

console.log('Total predictions:', myPredictions.length);
```

### Market Resolution

#### `resolveMarket`

Resolve a market with winning outcome.

```solidity
function resolveMarket(
    uint256 marketId,
    uint256 winningOutcomeId
) external onlyOracle
```

**Parameters:**
- `marketId` - ID of the market to resolve
- `winningOutcomeId` - Index of winning outcome

**Requirements:**
- Caller must be authorized oracle
- Market must be in Pending status
- Current time > market.endTime

**Events Emitted:**
- `MarketResolved(uint256 marketId, uint256 winningOutcomeId)`

**Example:**
```typescript
// Only callable by oracle contract
const tx = await marketFactory.resolveMarket(
  1, // marketId
  0  // YES wins
);

await tx.wait();
```

#### `claimWinnings`

Claim rewards from winning predictions.

```solidity
function claimWinnings(uint256 predictionId)
    external
    returns (uint256 payout)
```

**Parameters:**
- `predictionId` - ID of the prediction to claim

**Requirements:**
- Market must be Resolved
- Prediction must be on winning outcome
- Not already claimed

**Returns:**
- `payout` - Amount of ORX received (stake + winnings)

**Events Emitted:**
- `WinningsClaimed(uint256 predictionId, address claimer, uint256 payout)`

**Example:**
```typescript
const tx = await marketFactory.claimWinnings(123);
const receipt = await tx.wait();

const payout = receipt.logs[0].args.payout;
console.log('Claimed:', ethers.formatEther(payout), 'ORX');
```

**Gas Estimate:** ~90,000

#### `claimMultiple`

Claim multiple predictions in one transaction.

```solidity
function claimMultiple(uint256[] memory predictionIds)
    external
    returns (uint256 totalPayout)
```

**Example:**
```typescript
// Claim 5 predictions at once
const tx = await marketFactory.claimMultiple([101, 102, 103, 104, 105]);
const receipt = await tx.wait();

console.log('Total claimed:', ethers.formatEther(receipt.logs[0].args.totalPayout));
```

**Gas Estimate:** ~250,000 (for 5 predictions)

### Market Statistics

#### `getMarketStats`

Get detailed market statistics.

```solidity
function getMarketStats(uint256 marketId)
    external
    view
    returns (MarketStats memory)
```

**Returns:**
```solidity
struct MarketStats {
    uint256 totalVolume;
    uint256 totalPredictors;
    uint256[] outcomeTotals;
    uint256[] outcomeCounts;
    uint256 creatorStake;
}
```

**Example:**
```typescript
const stats = await marketFactory.getMarketStats(1);

console.log('Total Volume:', ethers.formatEther(stats.totalVolume));
console.log('Predictors:', stats.totalPredictors.toString());

stats.outcomeTotals.forEach((total, i) => {
  const percentage = (Number(total) / Number(stats.totalVolume)) * 100;
  console.log(`Outcome ${i}: ${percentage.toFixed(2)}%`);
});
```

#### `getOutcomeOdds`

Calculate current odds for all outcomes.

```solidity
function getOutcomeOdds(uint256 marketId)
    external
    view
    returns (uint256[] memory odds)
```

**Returns:**
- Array of odds in basis points (10000 = 100%)

**Example:**
```typescript
const odds = await marketFactory.getOutcomeOdds(1);

odds.forEach((odd, i) => {
  const percentage = Number(odd) / 100;
  console.log(`Outcome ${i}: ${percentage}%`);
});

// Output:
// Outcome 0: 67.5%
// Outcome 1: 32.5%
```

##  Events

### MarketCreated
```solidity
event MarketCreated(
    uint256 indexed marketId,
    address indexed creator,
    string question,
    string category,
    uint256 endTime
)
```

**Listen for new markets:**
```typescript
marketFactory.on('MarketCreated', (marketId, creator, question) => {
  console.log(`New market #${marketId}: ${question}`);
  console.log(`Created by: ${creator}`);
});
```

### PredictionMade
```solidity
event PredictionMade(
    uint256 indexed marketId,
    uint256 indexed predictionId,
    address indexed predictor,
    uint256 outcomeId,
    uint256 amount
)
```

**Listen for predictions:**
```typescript
// All predictions
marketFactory.on('PredictionMade', (marketId, predictionId, predictor, outcomeId, amount) => {
  console.log(`Prediction on market ${marketId}`);
  console.log(`${predictor} bet ${ethers.formatEther(amount)} on outcome ${outcomeId}`);
});

// Filter by market
const filter = marketFactory.filters.PredictionMade(1); // marketId = 1
marketFactory.on(filter, (marketId, predictionId, predictor, outcomeId, amount) => {
  console.log(`New bet: ${ethers.formatEther(amount)} ORX`);
});
```

### MarketResolved
```solidity
event MarketResolved(
    uint256 indexed marketId,
    uint256 winningOutcomeId,
    uint256 totalWinners,
    uint256 totalPayout
)
```

**Listen for resolutions:**
```typescript
marketFactory.on('MarketResolved', (marketId, winningOutcomeId, totalWinners, totalPayout) => {
  console.log(`Market ${marketId} resolved!`);
  console.log(`Winning outcome: ${winningOutcomeId}`);
  console.log(`Winners: ${totalWinners}`);
  console.log(`Total payout: ${ethers.formatEther(totalPayout)} ORX`);
});
```

### WinningsClaimed
```solidity
event WinningsClaimed(
    uint256 indexed predictionId,
    address indexed claimer,
    uint256 payout
)
```

**Track claims:**
```typescript
marketFactory.on('WinningsClaimed', (predictionId, claimer, payout) => {
  console.log(`${claimer} claimed ${ethers.formatEther(payout)} ORX`);
});
```

##  Admin Functions

### `setOracleAddress`

Update the oracle contract address.

```solidity
function setOracleAddress(address newOracle) external onlyOwner
```

### `setMinimumStake`

Update minimum stake requirement.

```solidity
function setMinimumStake(uint256 newMinimum) external onlyOwner
```

### `setCreatorStake`

Update creator stake requirement.

```solidity
function setCreatorStake(uint256 newStake) external onlyOwner
```

### `setPlatformFee`

Update platform fee percentage.

```solidity
function setPlatformFee(uint256 newFee) external onlyOwner
```

##  Storage Layout

```solidity
contract OracleXMarketFactory {
    // State variables
    uint256 public marketCount;
    uint256 public predictionCount;
    uint256 public minimumStake; // 10 ORX
    uint256 public creatorStake;  // 1,000 ORX
    uint256 public platformFee;   // 200 basis points (2%)
    
    address public orxToken;
    address public oracleContract;
    address public treasury;
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => Prediction) public predictions;
    mapping(address => uint256[]) public userPredictions;
    mapping(address => uint256[]) public userMarkets;
}
```

##  Testing Examples

```typescript
describe('MarketFactory', () => {
  it('Should create a market', async () => {
    const tx = await marketFactory.createMarket(
      "Test question?",
      "test",
      futureTimestamp,
      "test source",
      ["YES", "NO"],
      { value: ethers.parseEther("1000") }
    );
    
    const receipt = await tx.wait();
    const marketId = receipt.logs[0].args.marketId;
    
    expect(marketId).to.equal(1);
  });

  it('Should place a prediction', async () => {
    await orxToken.approve(marketFactory.address, ethers.parseEther("1000"));
    
    const tx = await marketFactory.predict(
      1, // marketId
      0, // YES
      ethers.parseEther("1000")
    );
    
    await tx.wait();
    
    const prediction = await marketFactory.getPrediction(1);
    expect(prediction.amount).to.equal(ethers.parseEther("1000"));
  });

  it('Should resolve market and claim winnings', async () => {
    // Resolve as oracle
    await marketFactory.connect(oracle).resolveMarket(1, 0);
    
    // Claim as winner
    const balanceBefore = await orxToken.balanceOf(user.address);
    await marketFactory.claimWinnings(1);
    const balanceAfter = await orxToken.balanceOf(user.address);
    
    expect(balanceAfter).to.be.gt(balanceBefore);
  });
});
```

##  Resources

- **Contract**: https://testnet.bscscan.com/address/0x273C8Dde70897069BeC84394e235feF17e7c5E1b
- **Source Code**: `/contracts/contracts/MarketFactory.sol`
- **Tests**: `/contracts/test/MarketFactory.test.ts`
- **ABI**: `/frontend/src/abis/MarketFactory.json`

## See Also

- [ORX Token Contract ](orx-token.md)
- [Oracle Bridge ](oracle-bridge.md)
- [Creating Markets Guide ](../../user-guides/creating-markets.md)

---

<div style="background: linear-gradient(135deg, #FFD700, #9333EA); padding: 1.5rem; border-radius: 12px; color: white;">
  <strong> Market Factory:</strong> The heart of OracleX - where all prediction markets are born and managed on-chain.
</div>

