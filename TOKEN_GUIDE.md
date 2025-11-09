# ORX Token Creation & Management Guide

## Token Overview

**ORX Token** is the native utility and governance token for the OracleX platform.

### Token Details
- **Name:** OracleX
- **Symbol:** ORX
- **Decimals:** 18
- **Total Supply:** 1,000,000,000 ORX (1 billion)
- **Blockchain:** BNB Smart Chain (BSC)
- **Standard:** ERC-20 + ERC20Votes + ERC20Permit

### Token Distribution

| Allocation | Percentage | Amount | Purpose |
|------------|-----------|---------|---------|
| Ecosystem | 40% | 400M ORX | Rewards, liquidity mining, user incentives |
| Investors | 20% | 200M ORX | Private sale, strategic partners |
| Team | 15% | 150M ORX | Core team, advisors (vested) |
| Treasury | 15% | 150M ORX | DAO treasury, grants, partnerships |
| Liquidity | 10% | 100M ORX | DEX liquidity pools |

## Already Deployed Token

✅ **Your ORX token is already deployed!**

- **Contract Address:** `0x7eE4f73bab260C11c68e5560c46E3975E824ed79`
- **Network:** BSC Testnet (Chain ID: 97)
- **Explorer:** https://testnet.bscscan.com/token/0x7eE4f73bab260C11c68e5560c46E3975E824ed79

## Token Features

### 1. ERC-20 Standard
- ✅ Transfer, approve, transferFrom
- ✅ Balance tracking
- ✅ Allowances

### 2. Governance (ERC20Votes)
- ✅ On-chain voting power
- ✅ Delegation support
- ✅ Snapshot-based voting
- ✅ Used for DAO proposals

### 3. Gasless Approvals (ERC20Permit)
- ✅ EIP-2612 permit signatures
- ✅ Gasless token approvals
- ✅ Better UX for users

### 4. Minting System
- ✅ Controlled minting for rewards
- ✅ Max supply cap enforced
- ✅ Only authorized contracts can mint
- ✅ Used for staking rewards

### 5. Burning
- ✅ Users can burn their tokens
- ✅ Deflationary mechanism
- ✅ Reduces total supply

## Setup & Deployment

### Option 1: Use Existing Token (Recommended)

Your token is already deployed at `0x7eE4f73bab260C11c68e5560c46E3975E824ed79`.

Just update your environment variables:

```bash
# In contracts/.env
ORX_TOKEN_ADDRESS="0x7eE4f73bab260C11c68e5560c46E3975E824ed79"

# In backend/.env
ORX_TOKEN_ADDRESS="0x7eE4f73bab260C11c68e5560c46E3975E824ed79"

# In frontend/.env
VITE_ORX_TOKEN_ADDRESS="0x7eE4f73bab260C11c68e5560c46E3975E824ed79"
```

### Option 2: Deploy New Token

If you need to deploy a fresh token:

```bash
cd contracts

# 1. Set wallet addresses in .env
TEAM_WALLET="0x..."
INVESTORS_WALLET="0x..."
ECOSYSTEM_WALLET="0x..."
TREASURY_WALLET="0x..."
LIQUIDITY_WALLET="0x..."

# 2. Deploy token
npx hardhat run scripts/deploy-token.ts --network bscTestnet

# 3. Verify on BSCScan (use command from deployment output)
npx hardhat verify --network bscTestnet <TOKEN_ADDRESS> "0x..." "0x..." "0x..." "0x..." "0x..."

# 4. Update .env files with new address
```

## Minter Management

### Add Minting Permissions

Contracts that need to mint rewards (Staking, Governance, etc.) need minter permissions:

```bash
cd contracts

# 1. Set contract addresses in .env
STAKING_CONTRACT_ADDRESS="0x..."
GOVERNANCE_DAO_ADDRESS="0x..."
ECOSYSTEM_REWARDS_ADDRESS="0x..."

# 2. Run minter management script
npx hardhat run scripts/manage-minters.ts --network bscTestnet
```

### Manual Minter Management

```typescript
// Add minter (owner only)
await orxToken.addMinter("0xContractAddress");

// Remove minter (owner only)
await orxToken.removeMinter("0xContractAddress");

// Check if address is minter
const isMinter = await orxToken.minters("0xAddress");
```

## Frontend Integration

### Add Token to MetaMask

```javascript
// Add ORX token to user's wallet
await window.ethereum.request({
  method: 'wallet_watchAsset',
  params: {
    type: 'ERC20',
    options: {
      address: '0x7eE4f73bab260C11c68e5560c46E3975E824ed79',
      symbol: 'ORX',
      decimals: 18,
      image: 'https://oraclex.ai/token-logo.png', // Your logo URL
    },
  },
});
```

### Check Token Balance

```typescript
import { ethers } from 'ethers';

const ORX_TOKEN_ADDRESS = '0x7eE4f73bab260C11c68e5560c46E3975E824ed79';
const ORX_TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)'
];

const provider = new ethers.BrowserProvider(window.ethereum);
const orxToken = new ethers.Contract(ORX_TOKEN_ADDRESS, ORX_TOKEN_ABI, provider);

// Get balance
const balance = await orxToken.balanceOf(userAddress);
console.log('ORX Balance:', ethers.formatEther(balance));
```

### Approve Spending

```typescript
// Approve staking contract to spend tokens
const signer = await provider.getSigner();
const orxToken = new ethers.Contract(ORX_TOKEN_ADDRESS, ORX_TOKEN_ABI, signer);

const stakingAddress = '0x...';
const amount = ethers.parseEther('100'); // 100 ORX

const tx = await orxToken.approve(stakingAddress, amount);
await tx.wait();
```

## Token Economics

### Use Cases

1. **Staking**
   - Stake ORX to participate in prediction markets
   - Earn rewards for accurate predictions
   - Higher stakes = higher potential rewards

2. **Governance**
   - Vote on platform proposals
   - 1 ORX = 1 vote
   - Delegate voting power to others

3. **Oracle Validation**
   - Stake ORX to become oracle validator
   - Earn fees for market resolution
   - Slashed for incorrect resolutions

4. **Premium Features**
   - Access advanced AI insights
   - Priority market creation
   - Reduced platform fees

5. **Liquidity Mining**
   - Provide liquidity to ORX/BNB pools
   - Earn trading fees + ORX rewards

### Reward Distribution

```solidity
// Staking contracts can mint rewards
orxToken.mint(userAddress, rewardAmount);

// Max supply enforced
require(totalSupply() + amount <= TOTAL_SUPPLY, "Exceeds max supply");
```

## Testing

### Get Test ORX Tokens

For development/testing:

```bash
# 1. Get BSC Testnet BNB from faucet
https://testnet.bnbchain.org/faucet-smart

# 2. Use faucet script (if available)
npx hardhat run scripts/faucet.ts --network bscTestnet

# 3. Or mint from ecosystem wallet (if you control it)
```

### Test Token Functions

```bash
cd contracts

# Check balance
npx hardhat console --network bscTestnet
> const ORX = await ethers.getContractAt("ORXToken", "0x7eE4f73bab260C11c68e5560c46E3975E824ed79")
> const balance = await ORX.balanceOf("0xYourAddress")
> ethers.formatEther(balance)

# Transfer tokens
> const tx = await ORX.transfer("0xRecipient", ethers.parseEther("10"))
> await tx.wait()
```

## Security Considerations

### 1. Minter Access Control
- ⚠️ Only trusted contracts should be minters
- ⚠️ Audit all contracts before adding as minters
- ✅ Remove minters if contracts are deprecated

### 2. Max Supply Cap
- ✅ Hard cap at 1 billion ORX
- ✅ Cannot mint beyond total supply
- ✅ Prevents infinite inflation

### 3. Ownership
- ⚠️ Owner can add/remove minters
- 💡 Consider transferring to multisig or DAO
- 💡 Or renounce ownership after setup

### 4. Burning
- ✅ Anyone can burn their own tokens
- ✅ Permanently removes from supply
- ⚠️ Cannot be undone

## Troubleshooting

### Token Not Showing in MetaMask

**Solution:** Manually add token using contract address:
1. Open MetaMask
2. Click "Import Tokens"
3. Paste: `0x7eE4f73bab260C11c68e5560c46E3975E824ed79`
4. Symbol and decimals auto-populate

### Insufficient Allowance Error

**Solution:** Approve spending before transfers:
```typescript
await orxToken.approve(spenderAddress, amount);
```

### Minting Fails

**Possible causes:**
- Not authorized minter: `await orxToken.addMinter(address)`
- Exceeds max supply: Check total supply vs cap
- Contract not deployed: Verify contract address

### Transaction Reverts

**Check:**
1. Sufficient BNB for gas fees
2. Token balance is sufficient
3. Allowance is set (for transferFrom)
4. Contract address is correct
5. Network is BSC Testnet (97)

## Next Steps

Now that you have the ORX token:

1. ✅ **Integrate with Staking** - Let users stake ORX
2. ✅ **Add to Governance** - Use ORX for voting
3. ⬜ **Create Liquidity Pool** - ORX/BNB on PancakeSwap
4. ⬜ **Setup Reward System** - Mint ORX for accurate predictions
5. ⬜ **Add Token Faucet** - Give test tokens to users
6. ⬜ **Token Analytics** - Show ORX stats on dashboard

## Resources

- **Contract:** [View on BSCScan](https://testnet.bscscan.com/token/0x7eE4f73bab260C11c68e5560c46E3975E824ed79)
- **Add to MetaMask:** Use address above
- **Get Test BNB:** https://testnet.bnbchain.org/faucet-smart
- **OpenZeppelin Docs:** https://docs.openzeppelin.com/contracts/4.x/erc20
- **Hardhat Verify:** https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify

## Support

For token-related issues:
- Check contract on BSCScan explorer
- Verify network is BSC Testnet (Chain ID 97)
- Ensure you have test BNB for gas
- Review transaction logs for error messages
