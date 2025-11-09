# User Guide: How to Get ORX Tokens

Learn how to acquire ORX tokens for the OracleX platform on BNB Smart Chain Testnet.

## 🎯 Quick Overview

There are several ways to get ORX tokens:

1. **Faucet** (Easiest) - Get 1,000 free test ORX
2. **Winning Predictions** - Earn from correct predictions
3. **Staking Rewards** - Earn passive income
4. **DEX Trading** - Buy/sell on decentralized exchanges
5. **Liquidity Mining** - Provide liquidity for rewards

## 🚰 Method 1: Faucet (Recommended for Beginners)

The fastest way to get started with test ORX tokens.

### Prerequisites
- ✅ MetaMask wallet installed
- ✅ Connected to BNB Smart Chain Testnet
- ✅ Small amount of test BNB for gas (~0.01 BNB)

### Step-by-Step Instructions

#### Step 1: Get Test BNB
You need BNB for gas fees to claim ORX.

1. Visit **BNB Chain Faucet**: https://testnet.bnbchain.org/faucet-smart
2. Connect your wallet
3. Request test BNB (you'll receive ~0.1 BNB)
4. Wait 30-60 seconds for transaction

#### Step 2: Claim ORX from Faucet

**Option A: Using OracleX Website (Recommended)**

1. Go to https://oraclex.com/faucet
2. Click **"Connect Wallet"**
3. Select MetaMask and approve connection
4. Click **"Claim 1,000 ORX"** button
5. Confirm transaction in MetaMask
6. Wait for confirmation (~3 seconds)
7. Check your balance in wallet

**Option B: Direct Contract Interaction**

```typescript
// Connect to faucet contract
const FAUCET_ADDRESS = '0x1234...'; // Faucet contract address
const faucetAbi = [
  'function claimTokens() external',
  'function getClaimableAmount(address) view returns (uint256)',
  'function getTimeUntilNextClaim(address) view returns (uint256)'
];

const faucet = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, signer);

// Check if you can claim
const timeUntilNext = await faucet.getTimeUntilNextClaim(yourAddress);
console.log('Can claim in:', timeUntilNext, 'seconds');

// Claim tokens
if (timeUntilNext === 0) {
  const tx = await faucet.claimTokens();
  await tx.wait();
  console.log('Claimed 1,000 ORX!');
}
```

### Faucet Limits
- **Amount**: 1,000 ORX per claim
- **Cooldown**: 24 hours between claims
- **Daily Limit**: 10,000 total claims per day
- **Requirements**: Wallet must have < 5,000 ORX

### Troubleshooting Faucet

| Issue | Solution |
|-------|----------|
| "Already claimed" | Wait 24 hours since last claim |
| "Insufficient gas" | Get more test BNB from faucet |
| "Daily limit reached" | Try again tomorrow |
| "Balance too high" | Use existing tokens or create new wallet |

## 🎯 Method 2: Winning Predictions

Earn ORX by making correct predictions on markets.

### How It Works

1. Find an active prediction market
2. Analyze the question and outcomes
3. Stake ORX on your predicted outcome
4. Wait for market resolution
5. If correct, receive your stake + share of losing side

### Reward Calculation

```typescript
// Example prediction
const yourStake = 1000; // ORX
const totalCorrectStakes = 50000; // ORX
const totalIncorrectStakes = 30000; // ORX
const platformFee = 0.02; // 2%

// Calculate your share
const yourSharePercentage = yourStake / totalCorrectStakes; // 2%
const winningPool = totalIncorrectStakes * (1 - platformFee); // 29,400 ORX
const yourReward = winningPool * yourSharePercentage; // 588 ORX

// Total return
const totalReturn = yourStake + yourReward; // 1,588 ORX (58.8% profit!)
```

### Prediction Strategy Tips

1. **Research Thoroughly**: Use TruthMesh AI for insights
2. **Diversify**: Don't put all ORX in one market
3. **Early Bird**: Earlier predictions often get better odds
4. **Watch Volume**: High-volume markets are more liquid
5. **Read Resolution Source**: Understand how outcome is determined

### Example: Making a Prediction

```typescript
// 1. Get market details
const market = await marketFactory.getMarket(marketId);
console.log('Question:', market.question);
console.log('End Time:', new Date(market.endTime * 1000));

// 2. Check current odds
const yesStakes = await market.getTotalStakes(true);
const noStakes = await market.getTotalStakes(false);
const impliedProbability = yesStakes / (yesStakes + noStakes);
console.log('YES implied probability:', impliedProbability * 100, '%');

// 3. Make prediction
const stakeAmount = ethers.parseEther('1000'); // 1,000 ORX
const tx = await market.predict(true, stakeAmount); // Predict YES
await tx.wait();

console.log('Prediction placed! Market resolves:', market.endTime);
```

## 💎 Method 3: Staking Rewards

Earn passive income by staking ORX tokens.

### Staking Options

| Lock Period | APY | Minimum | Rewards Frequency |
|-------------|-----|---------|-------------------|
| **30 days** | 5% | 100 ORX | Claimed at unlock |
| **90 days** | 14.4% | 100 ORX | Claimed at unlock |
| **180 days** | 37.5% | 100 ORX | Claimed at unlock |
| **365 days** | 72% | 100 ORX | Claimed at unlock |

### How to Stake

**Via Website:**

1. Go to https://oraclex.com/staking
2. Click **"Stake ORX"**
3. Enter amount and select lock period
4. Approve ORX spending (first time only)
5. Confirm staking transaction
6. Track rewards in dashboard

**Via Contract:**

```typescript
// 1. Approve staking contract
const STAKING_ADDRESS = '0x007Aaa957829ea04e130809e9cebbBd4d06dABa2';
const ORX_ADDRESS = '0x7eE4f73bab260C11c68e5560c46E3975E824ed79';

const orxToken = new ethers.Contract(ORX_ADDRESS, orxAbi, signer);
const stakingContract = new ethers.Contract(STAKING_ADDRESS, stakingAbi, signer);

// Approve tokens
const amount = ethers.parseEther('5000'); // 5,000 ORX
const approveTx = await orxToken.approve(STAKING_ADDRESS, amount);
await approveTx.wait();

// 2. Stake tokens
const lockPeriod = 90 * 24 * 60 * 60; // 90 days in seconds
const stakeTx = await stakingContract.stake(amount, lockPeriod);
await stakeTx.wait();

console.log('Staked 5,000 ORX for 90 days at 14.4% APY');
console.log('Expected reward:', 5000 * 0.144, 'ORX');
```

### Claiming Rewards

```typescript
// Check your stakes
const stakes = await stakingContract.getUserStakes(yourAddress);

stakes.forEach((stake, index) => {
  console.log(`Stake ${index + 1}:`);
  console.log('Amount:', ethers.formatEther(stake.amount), 'ORX');
  console.log('Lock ends:', new Date(stake.unlockTime * 1000));
  console.log('Reward:', ethers.formatEther(stake.reward), 'ORX');
});

// Claim after lock period ends
const stakeId = 0;
const claimTx = await stakingContract.unstake(stakeId);
await claimTx.wait();

console.log('Claimed stake + rewards!');
```

## 🔄 Method 4: DEX Trading

Buy or sell ORX on decentralized exchanges.

### Supported DEXs

| DEX | Liquidity | Fees | Link |
|-----|-----------|------|------|
| **PancakeSwap** | Highest | 0.25% | https://pancakeswap.finance |
| **Biswap** | Medium | 0.1% | https://biswap.org |
| **ApeSwap** | Low | 0.2% | https://apeswap.finance |

### How to Buy ORX

**Step 1: Get BNB**
- Buy BNB on centralized exchange (Binance, KuCoin)
- Withdraw to your wallet on BSC network

**Step 2: Swap BNB for ORX**

1. Go to PancakeSwap: https://pancakeswap.finance/swap
2. Connect wallet
3. Select BNB → ORX
4. Enter amount of BNB to swap
5. Check slippage (recommend 1-2%)
6. Click **"Swap"**
7. Confirm transaction

**Via Code:**

```typescript
// PancakeSwap Router
const ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
const WBNB_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const ORX_ADDRESS = '0x7eE4f73bab260C11c68e5560c46E3975E824ed79';

const router = new ethers.Contract(ROUTER_ADDRESS, routerAbi, signer);

// Buy ORX with BNB
const amountInBNB = ethers.parseEther('0.1'); // 0.1 BNB
const amountOutMin = ethers.parseEther('950'); // Min 950 ORX (5% slippage)
const path = [WBNB_ADDRESS, ORX_ADDRESS];
const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

const tx = await router.swapExactETHForTokens(
  amountOutMin,
  path,
  yourAddress,
  deadline,
  { value: amountInBNB }
);

await tx.wait();
console.log('Bought ORX with BNB!');
```

### Price Chart & Analytics

```typescript
// Get current ORX price
const getORXPrice = async () => {
  const pair = await factory.getPair(WBNB_ADDRESS, ORX_ADDRESS);
  const pairContract = new ethers.Contract(pair, pairAbi, provider);
  
  const reserves = await pairContract.getReserves();
  const [reserveORX, reserveBNB] = reserves;
  
  const priceInBNB = reserveBNB / reserveORX;
  const bnbPriceUSD = 300; // Get from oracle
  const orxPriceUSD = priceInBNB * bnbPriceUSD;
  
  return orxPriceUSD;
};

const price = await getORXPrice();
console.log('ORX Price:', price, 'USD');
```

## 💧 Method 5: Liquidity Mining

Provide liquidity and earn trading fees + ORX rewards.

### How It Works

1. Add ORX + BNB to liquidity pool
2. Receive LP tokens representing your share
3. Stake LP tokens in farm contract
4. Earn:
   - 0.25% of all trading fees
   - Additional ORX rewards

### Adding Liquidity

```typescript
// PancakeSwap Router
const ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E';

const router = new ethers.Contract(ROUTER_ADDRESS, routerAbi, signer);

// 1. Approve tokens
const orxAmount = ethers.parseEther('10000'); // 10,000 ORX
const bnbAmount = ethers.parseEther('1'); // 1 BNB

await orxToken.approve(ROUTER_ADDRESS, orxAmount);

// 2. Add liquidity
const tx = await router.addLiquidityETH(
  ORX_ADDRESS,
  orxAmount,
  orxAmount * 95n / 100n, // Min 95% (5% slippage)
  bnbAmount * 95n / 100n,
  yourAddress,
  Math.floor(Date.now() / 1000) + 1200, // 20 min deadline
  { value: bnbAmount }
);

await tx.wait();
console.log('Liquidity added! You received LP tokens.');
```

### Staking LP Tokens

```typescript
// OracleX Farm Contract
const FARM_ADDRESS = '0x...';
const LP_TOKEN_ADDRESS = '0x...'; // ORX-BNB LP address

const lpToken = new ethers.Contract(LP_TOKEN_ADDRESS, erc20Abi, signer);
const farm = new ethers.Contract(FARM_ADDRESS, farmAbi, signer);

// 1. Approve LP tokens
const lpBalance = await lpToken.balanceOf(yourAddress);
await lpToken.approve(FARM_ADDRESS, lpBalance);

// 2. Stake LP tokens
const stakeTx = await farm.deposit(0, lpBalance); // Pool ID 0 = ORX-BNB
await stakeTx.wait();

// 3. Check pending rewards
const pendingRewards = await farm.pendingReward(0, yourAddress);
console.log('Pending ORX rewards:', ethers.formatEther(pendingRewards));

// 4. Harvest rewards
const harvestTx = await farm.harvest(0);
await harvestTx.wait();
```

### Expected Returns

```typescript
// Calculate LP APY
const tvl = 1_000_000; // $1M TVL in pool
const dailyVolume = 100_000; // $100k daily volume
const tradingFeeAPY = (dailyVolume * 0.0025 * 365) / tvl * 100; // ~9.1%

const orxRewardsPerDay = 5000; // 5k ORX daily emissions
const orxPrice = 0.5; // $0.50 per ORX
const rewardAPY = (orxRewardsPerDay * orxPrice * 365) / tvl * 100; // ~91.25%

const totalAPY = tradingFeeAPY + rewardAPY; // ~100.35%

console.log('Trading Fee APY:', tradingFeeAPY, '%');
console.log('ORX Rewards APY:', rewardAPY, '%');
console.log('Total APY:', totalAPY, '%');
```

## 🎁 Special Events & Airdrops

### Community Rewards

Join community events to earn bonus ORX:

- **Twitter Campaigns**: 50-500 ORX
- **Content Creation**: 1,000-10,000 ORX
- **Bug Bounties**: 5,000-50,000 ORX
- **Referral Program**: 10% of referee's earnings

### Airdrop Eligibility

Check if you're eligible for future airdrops:

```typescript
// Check airdrop eligibility
const checkEligibility = async (address: string) => {
  // Criteria:
  // 1. Made at least 10 predictions
  const predictions = await getPredictionCount(address);
  
  // 2. Staked ORX for 90+ days
  const stakes = await getStakingHistory(address);
  const hasLongStake = stakes.some(s => s.lockPeriod >= 90 * 24 * 60 * 60);
  
  // 3. Participated in governance
  const votes = await getVoteCount(address);
  
  // 4. Provided liquidity
  const lpBalance = await lpToken.balanceOf(address);
  
  return {
    eligible: predictions >= 10 && hasLongStake && votes >= 1,
    predictions,
    hasLongStake,
    votes,
    lpBalance: ethers.formatEther(lpBalance)
  };
};
```

## 📊 Verify Your ORX Balance

### In MetaMask

1. Open MetaMask
2. Click **"Assets"** tab
3. Look for **ORX** token
4. If not visible, click **"Import tokens"**
5. Enter contract: `0x7eE4f73bab260C11c68e5560c46E3975E824ed79`

### Programmatically

```typescript
// Check ORX balance
const ORX_ADDRESS = '0x7eE4f73bab260C11c68e5560c46E3975E824ed79';
const orxToken = new ethers.Contract(ORX_ADDRESS, orxAbi, provider);

const balance = await orxToken.balanceOf(yourAddress);
console.log('ORX Balance:', ethers.formatEther(balance));

// Check in staking
const staked = await stakingContract.getTotalStaked(yourAddress);
console.log('Staked ORX:', ethers.formatEther(staked));

// Total holdings
const total = balance + staked;
console.log('Total ORX:', ethers.formatEther(total));
```

## 🛡️ Security Tips

1. ✅ **Verify Addresses**: Always check contract addresses
2. ✅ **Use Hardware Wallet**: For large amounts
3. ✅ **Check Slippage**: Prevent MEV attacks
4. ✅ **Start Small**: Test with small amounts first
5. ⚠️ **Never Share Keys**: Keep private keys private
6. ⚠️ **Beware Phishing**: Only use official links
7. ⚠️ **Double-Check**: Verify transaction details before confirming

## 🔗 Official Resources

- **Faucet**: https://oraclex.com/faucet
- **Swap (PancakeSwap)**: https://pancakeswap.finance/swap?outputCurrency=0x7eE4f73bab260C11c68e5560c46E3975E824ed79
- **Staking**: https://oraclex.com/staking
- **Token Contract**: https://testnet.bscscan.com/token/0x7eE4f73bab260C11c68e5560c46E3975E824ed79
- **Support**: https://discord.gg/oraclex

## Next Steps

Now that you have ORX tokens:

1. [Make Your First Prediction →](making-predictions.md)
2. [Stake for Passive Income →](staking-guide.md)
3. [Create Your Own Market →](creating-markets.md)
4. [Participate in Governance →](governance.md)

---

<div style="background: linear-gradient(135deg, #FFD700, #9333EA); padding: 1.5rem; border-radius: 12px; color: white;">
  <strong>🎉 Welcome to OracleX!</strong> You're now ready to start predicting the future and earning rewards. Join our Discord community for tips and support!
</div>
