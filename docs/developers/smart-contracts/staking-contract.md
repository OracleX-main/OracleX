# Staking Contract

The Staking Contract allows users to lock ORX tokens for fixed periods and earn rewards.

##  Contract Details

| Property | Value |
|----------|-------|
| **Name** | OracleXStaking |
| **Address** | `0x007Aaa957829ea04e130809e9cebbBd4d06dABa2` |
| **Network** | BNB Chain Testnet (97) |
| **Upgradeable** | Yes (UUPS Proxy) |
| **Admin** | Governance DAO |

##  Core Functions

### Staking Operations

#### `stake`

Lock ORX tokens for a specified period.

```solidity
function stake(
    uint256 amount,
    uint256 lockPeriod
) external returns (uint256 stakeId)
```

**Parameters:**
- `amount` - Amount of ORX to stake (in wei)
- `lockPeriod` - Lock duration in seconds (must be 30, 90, 180, or 365 days)

**Requirements:**
- Caller must have sufficient ORX balance
- Caller must have approved contract to spend ORX
- Amount >= minimum stake (100 ORX)
- Lock period must be valid (2592000, 7776000, 15552000, or 31536000 seconds)

**Returns:**
- `stakeId` - Unique identifier for the stake

**Events Emitted:**
- `Staked(address indexed user, uint256 stakeId, uint256 amount, uint256 lockPeriod)`

**Example:**
```typescript
// First approve ORX
await orxToken.approve(
  stakingContractAddress,
  ethers.parseEther("5000")
);

// Stake for 90 days
const lockPeriod = 90 * 24 * 60 * 60; // 7776000 seconds
const tx = await stakingContract.stake(
  ethers.parseEther("5000"),
  lockPeriod
);

const receipt = await tx.wait();
const stakeId = receipt.logs[0].args.stakeId;
console.log('Staked! Stake ID:', stakeId);
```

**Gas Estimate:** ~150,000

#### `unstake`

Withdraw stake after lock period ends.

```solidity
function unstake(uint256 stakeId) external returns (uint256 totalAmount)
```

**Parameters:**
- `stakeId` - ID of the stake to withdraw

**Requirements:**
- Caller must own the stake
- Lock period must have ended
- Stake not already withdrawn

**Returns:**
- `totalAmount` - Original stake + earned rewards

**Events Emitted:**
- `Unstaked(address indexed user, uint256 stakeId, uint256 amount, uint256 reward)`

**Example:**
```typescript
// Check if unlocked
const stake = await stakingContract.stakes(stakeId);
const now = Math.floor(Date.now() / 1000);

if (now >= stake.unlockTime) {
  const tx = await stakingContract.unstake(stakeId);
  const receipt = await tx.wait();
  
  const amount = receipt.logs[0].args.amount;
  const reward = receipt.logs[0].args.reward;
  
  console.log('Withdrawn:', ethers.formatEther(amount), 'ORX');
  console.log('Reward:', ethers.formatEther(reward), 'ORX');
}
```

**Gas Estimate:** ~120,000

#### `emergencyUnstake`

Withdraw stake early with penalty.

```solidity
function emergencyUnstake(uint256 stakeId) 
    external 
    returns (uint256 amountReturned)
```

**Parameters:**
- `stakeId` - ID of the stake to withdraw

**Requirements:**
- Caller must own the stake
- Stake not already withdrawn

**Penalty:**
- 50% of earned rewards forfeited
- Original stake returned in full
- Forfeited rewards distributed to remaining stakers

**Returns:**
- `amountReturned` - Original stake + 50% of rewards

**Events Emitted:**
- `EmergencyUnstaked(address indexed user, uint256 stakeId, uint256 amount, uint256 penalty)`

**Example:**
```typescript
// Emergency withdrawal
const tx = await stakingContract.emergencyUnstake(stakeId);
const receipt = await tx.wait();

const returned = receipt.logs[0].args.amount;
const penalty = receipt.logs[0].args.penalty;

console.log('Returned:', ethers.formatEther(returned), 'ORX');
console.log('Penalty:', ethers.formatEther(penalty), 'ORX');
```

**Gas Estimate:** ~130,000

### Viewing Stakes

#### `getStake`

Get detailed stake information.

```solidity
function getStake(uint256 stakeId)
    external
    view
    returns (Stake memory)
```

**Returns:**
```solidity
struct Stake {
    uint256 id;
    address staker;
    uint256 amount;
    uint256 lockPeriod;
    uint256 startTime;
    uint256 unlockTime;
    uint256 apy;
    uint256 reward;
    bool withdrawn;
}
```

**Example:**
```typescript
const stake = await stakingContract.getStake(1);

console.log('Amount:', ethers.formatEther(stake.amount));
console.log('Lock Period:', stake.lockPeriod / 86400, 'days');
console.log('APY:', stake.apy / 100, '%');
console.log('Unlock:', new Date(stake.unlockTime * 1000));
console.log('Reward:', ethers.formatEther(stake.reward));
console.log('Withdrawn:', stake.withdrawn);
```

#### `getUserStakes`

Get all stakes for a user.

```solidity
function getUserStakes(address user)
    external
    view
    returns (Stake[] memory)
```

**Example:**
```typescript
const stakes = await stakingContract.getUserStakes(userAddress);

console.log(`Total stakes: ${stakes.length}`);

stakes.forEach((stake, i) => {
  console.log(`\nStake #${i + 1}:`);
  console.log('Amount:', ethers.formatEther(stake.amount), 'ORX');
  console.log('Status:', stake.withdrawn ? 'Withdrawn' : 'Active');
  console.log('Reward:', ethers.formatEther(stake.reward), 'ORX');
});
```

#### `getUserActiveStakes`

Get only active (not withdrawn) stakes.

```solidity
function getUserActiveStakes(address user)
    external
    view
    returns (Stake[] memory)
```

**Example:**
```typescript
const activeStakes = await stakingContract.getUserActiveStakes(userAddress);
console.log('Active stakes:', activeStakes.length);
```

#### `getTotalStaked`

Get user's total staked amount.

```solidity
function getTotalStaked(address user)
    external
    view
    returns (uint256 total)
```

**Example:**
```typescript
const totalStaked = await stakingContract.getTotalStaked(userAddress);
console.log('Total Staked:', ethers.formatEther(totalStaked), 'ORX');
```

### Reward Calculations

#### `calculateReward`

Calculate potential reward for a stake.

```solidity
function calculateReward(
    uint256 amount,
    uint256 lockPeriod
) external view returns (uint256 reward)
```

**Parameters:**
- `amount` - Stake amount in wei
- `lockPeriod` - Lock duration in seconds

**Returns:**
- `reward` - Calculated reward in wei

**Example:**
```typescript
// Calculate reward for 5,000 ORX staked for 90 days
const amount = ethers.parseEther("5000");
const lockPeriod = 90 * 24 * 60 * 60;

const reward = await stakingContract.calculateReward(amount, lockPeriod);

console.log('Stake:', ethers.formatEther(amount), 'ORX');
console.log('Period:', lockPeriod / 86400, 'days');
console.log('Reward:', ethers.formatEther(reward), 'ORX');
console.log('Total:', ethers.formatEther(amount + reward), 'ORX');
```

#### `getAPY`

Get APY for a lock period.

```solidity
function getAPY(uint256 lockPeriod)
    external
    view
    returns (uint256 apy)
```

**Returns:**
- `apy` - Annual Percentage Yield in basis points (10000 = 100%)

**Example:**
```typescript
// Get APY for different lock periods
const periods = [
  30 * 24 * 60 * 60,  // 30 days
  90 * 24 * 60 * 60,  // 90 days
  180 * 24 * 60 * 60, // 180 days
  365 * 24 * 60 * 60  // 365 days
];

for (const period of periods) {
  const apy = await stakingContract.getAPY(period);
  console.log(`${period / 86400} days: ${apy / 100}% APY`);
}

// Output:
// 30 days: 5% APY
// 90 days: 14.4% APY
// 180 days: 37.5% APY
// 365 days: 72% APY
```

#### `getCurrentReward`

Get current accrued reward for a stake.

```solidity
function getCurrentReward(uint256 stakeId)
    external
    view
    returns (uint256 reward)
```

**Example:**
```typescript
// Check real-time reward
const currentReward = await stakingContract.getCurrentReward(stakeId);
console.log('Current Reward:', ethers.formatEther(currentReward), 'ORX');

// This updates every block (~3 seconds)
```

### Pool Statistics

#### `getPoolStats`

Get staking pool statistics.

```solidity
function getPoolStats()
    external
    view
    returns (PoolStats memory)
```

**Returns:**
```solidity
struct PoolStats {
    uint256 totalStaked;
    uint256 totalStakers;
    uint256 totalRewardsPaid;
    uint256 averageAPY;
    uint256 rewardsRemaining;
}
```

**Example:**
```typescript
const stats = await stakingContract.getPoolStats();

console.log('Total Staked:', ethers.formatEther(stats.totalStaked), 'ORX');
console.log('Total Stakers:', stats.totalStakers.toString());
console.log('Rewards Paid:', ethers.formatEther(stats.totalRewardsPaid), 'ORX');
console.log('Average APY:', stats.averageAPY / 100, '%');
console.log('Rewards Left:', ethers.formatEther(stats.rewardsRemaining), 'ORX');
```

#### `getPoolByLockPeriod`

Get statistics for specific lock period.

```solidity
function getPoolByLockPeriod(uint256 lockPeriod)
    external
    view
    returns (LockPeriodPool memory)
```

**Returns:**
```solidity
struct LockPeriodPool {
    uint256 lockPeriod;
    uint256 totalStaked;
    uint256 stakersCount;
    uint256 apy;
}
```

**Example:**
```typescript
// Get 90-day pool stats
const pool = await stakingContract.getPoolByLockPeriod(7776000);

console.log('Lock Period:', pool.lockPeriod / 86400, 'days');
console.log('Total Staked:', ethers.formatEther(pool.totalStaked), 'ORX');
console.log('Stakers:', pool.stakersCount.toString());
console.log('APY:', pool.apy / 100, '%');
```

##  Events

### Staked
```solidity
event Staked(
    address indexed user,
    uint256 indexed stakeId,
    uint256 amount,
    uint256 lockPeriod,
    uint256 apy
)
```

**Listen for new stakes:**
```typescript
stakingContract.on('Staked', (user, stakeId, amount, lockPeriod, apy) => {
  console.log(`${user} staked ${ethers.formatEther(amount)} ORX`);
  console.log(`Lock Period: ${lockPeriod / 86400} days`);
  console.log(`APY: ${apy / 100}%`);
});
```

### Unstaked
```solidity
event Unstaked(
    address indexed user,
    uint256 indexed stakeId,
    uint256 amount,
    uint256 reward
)
```

**Track unstakes:**
```typescript
stakingContract.on('Unstaked', (user, stakeId, amount, reward) => {
  const total = amount + reward;
  console.log(`${user} unstaked ${ethers.formatEther(total)} ORX`);
  console.log(`Original: ${ethers.formatEther(amount)}`);
  console.log(`Reward: ${ethers.formatEther(reward)}`);
});
```

### EmergencyUnstaked
```solidity
event EmergencyUnstaked(
    address indexed user,
    uint256 indexed stakeId,
    uint256 amount,
    uint256 penalty
)
```

**Track emergency withdrawals:**
```typescript
stakingContract.on('EmergencyUnstaked', (user, stakeId, amount, penalty) => {
  console.log(`${user} emergency unstaked`);
  console.log(`Returned: ${ethers.formatEther(amount)} ORX`);
  console.log(`Penalty: ${ethers.formatEther(penalty)} ORX`);
});
```

### RewardDistributed
```solidity
event RewardDistributed(
    uint256 indexed stakeId,
    uint256 reward
)
```

**Track reward distributions:**
```typescript
stakingContract.on('RewardDistributed', (stakeId, reward) => {
  console.log(`Reward distributed to stake #${stakeId}`);
  console.log(`Amount: ${ethers.formatEther(reward)} ORX`);
});
```

##  Admin Functions

### `setAPY`

Update APY for a lock period.

```solidity
function setAPY(
    uint256 lockPeriod,
    uint256 newAPY
) external onlyOwner
```

**Example:**
```typescript
// Update 90-day APY to 15%
await stakingContract.setAPY(
  7776000, // 90 days
  1500     // 15% = 1500 basis points
);
```

### `setMinimumStake`

Update minimum stake requirement.

```solidity
function setMinimumStake(uint256 newMinimum) external onlyOwner
```

**Example:**
```typescript
// Set minimum to 50 ORX
await stakingContract.setMinimumStake(
  ethers.parseEther("50")
);
```

### `addRewards`

Add more rewards to the pool.

```solidity
function addRewards(uint256 amount) external onlyOwner
```

**Example:**
```typescript
// Add 100,000 ORX to rewards pool
await orxToken.transfer(
  stakingContractAddress,
  ethers.parseEther("100000")
);

await stakingContract.addRewards(
  ethers.parseEther("100000")
);
```

### `pause` / `unpause`

Emergency pause/unpause contract.

```solidity
function pause() external onlyOwner
function unpause() external onlyOwner
```

**Example:**
```typescript
// Pause in emergency
await stakingContract.pause();

// Resume when safe
await stakingContract.unpause();
```

##  Storage Layout

```solidity
contract OracleXStaking {
    // State variables
    uint256 public stakeCount;
    uint256 public totalStaked;
    uint256 public totalRewardsPaid;
    uint256 public minimumStake;
    
    address public orxToken;
    address public rewardPool;
    
    // APY rates (basis points: 500 = 5%)
    mapping(uint256 => uint256) public apyRates;
    
    // User stakes
    mapping(uint256 => Stake) public stakes;
    mapping(address => uint256[]) public userStakeIds;
    
    // Lock period pools
    mapping(uint256 => LockPeriodPool) public pools;
    
    // Supported lock periods (in seconds)
    uint256[] public lockPeriods;
}
```

##  Staking Formulas

### APY Calculation

```typescript
// Base APY rates
const baseAPY = {
  30: 0.05,   // 5%
  90: 0.12,   // 12%
  180: 0.25,  // 25%
  365: 0.40   // 40%
};

// Time multipliers
const multipliers = {
  30: 1.0,    // No bonus
  90: 1.2,    // +20%
  180: 1.5,   // +50%
  365: 1.8    // +80%
};

// Effective APY
const effectiveAPY = baseAPY[days] * multipliers[days];

// Examples:
// 30 days: 5%  1.0 = 5%
// 90 days: 12%  1.2 = 14.4%
// 180 days: 25%  1.5 = 37.5%
// 365 days: 40%  1.8 = 72%
```

### Reward Calculation

```typescript
// Simple interest formula
function calculateReward(amount, lockPeriod, apy) {
  const secondsPerYear = 31536000;
  const lockYears = lockPeriod / secondsPerYear;
  const reward = amount * apy * lockYears;
  return reward;
}

// Example: 5,000 ORX for 90 days at 14.4% APY
const amount = 5000;
const lockPeriod = 7776000; // 90 days in seconds
const apy = 0.144;

const lockYears = 7776000 / 31536000; // 0.2465 years
const reward = 5000 * 0.144 * 0.2465; // 177.53 ORX
```

##  Testing Examples

```typescript
describe('Staking Contract', () => {
  it('Should stake tokens', async () => {
    await orxToken.approve(staking.address, ethers.parseEther("5000"));
    
    const tx = await staking.stake(
      ethers.parseEther("5000"),
      7776000 // 90 days
    );
    
    const receipt = await tx.wait();
    const stakeId = receipt.logs[0].args.stakeId;
    
    const stake = await staking.getStake(stakeId);
    expect(stake.amount).to.equal(ethers.parseEther("5000"));
  });

  it('Should unstake after lock period', async () => {
    // Fast forward time
    await ethers.provider.send("evm_increaseTime", [7776000]);
    await ethers.provider.send("evm_mine");
    
    const balanceBefore = await orxToken.balanceOf(user.address);
    await staking.unstake(1);
    const balanceAfter = await orxToken.balanceOf(user.address);
    
    expect(balanceAfter).to.be.gt(balanceBefore);
  });

  it('Should apply penalty for early withdrawal', async () => {
    const stake = await staking.getStake(1);
    const expectedReward = stake.reward;
    
    await staking.emergencyUnstake(1);
    
    const balanceAfter = await orxToken.balanceOf(user.address);
    const received = balanceAfter - balanceBefore;
    
    // Should receive original + 50% of rewards
    const expected = stake.amount + (expectedReward / 2n);
    expect(received).to.equal(expected);
  });
});
```

##  Security Features

-  **ReentrancyGuard**: Prevents reentrancy attacks
-  **Pausable**: Can be paused in emergencies
-  **Access Control**: Only owner can modify parameters
-  **SafeERC20**: Safe token transfers
-  **Time Locks**: Enforced lock periods
-  **Audited**: Security audit by CertiK

##  Resources

- **Contract**: https://testnet.bscscan.com/address/0x007Aaa957829ea04e130809e9cebbBd4d06dABa2
- **Source Code**: `/contracts/contracts/Staking.sol`
- **Tests**: `/contracts/test/Staking.test.ts`
- **ABI**: `/frontend/src/abis/Staking.json`

## See Also

- [Staking Guide ](../../user-guides/staking-guide.md)
- [ORX Token ](orx-token.md)
- [Tokenomics ](../../tokenomics/orx-token.md)

---

<div style="background: linear-gradient(135deg, #FFD700, #9333EA); padding: 1.5rem; border-radius: 12px; color: white;">
  <strong> Staking Contract:</strong> Earn passive rewards by locking ORX tokens with secure, audited smart contracts on BNB Chain.
</div>

