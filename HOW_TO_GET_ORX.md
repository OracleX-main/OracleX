# Getting ORX Tokens for Staking - Quick Guide

## 🚰 Method 1: Use the Faucet (Easiest)

### Step-by-Step:

1. **Go to the Faucet Page**
   - Navigate to: https://your-app.com/faucet
   - Or click "Faucet" in the navigation menu

2. **Connect Your Wallet**
   - Click "Connect Wallet" button
   - Select MetaMask
   - Make sure you're on BSC Testnet (Chain ID: 97)

3. **Claim Tokens**
   - Click "Claim 1000 ORX" button
   - Confirm the transaction in MetaMask
   - Wait for confirmation (usually 3-5 seconds)
   - Tokens appear in your wallet!

4. **Check Your Balance**
   - Your ORX balance shows at the top of the faucet page
   - Click "Refresh" to update
   - You can claim again after 5 minutes

### What You Get:
- **1000 ORX per claim**
- **5-minute cooldown** between claims
- **Unlimited claims** (it's test tokens!)

---

## 💰 Method 2: Manual Transfer (Advanced)

If you control a wallet with ORX tokens, you can send them directly:

### Using Hardhat Script:

```bash
cd contracts

# Set recipient address in command or .env
npx hardhat run scripts/token-faucet.ts --network bscTestnet 0xRecipientAddress

# Or with custom amount
FAUCET_AMOUNT=5000 npm run token:faucet 0xRecipientAddress
```

### Using MetaMask:

1. Import ORX token contract:
   - Address: `0x7eE4f73bab260C11c68e5560c46E3975E824ed79`
   - Symbol: ORX
   - Decimals: 18

2. Send tokens:
   - Click "Send" in MetaMask
   - Enter recipient address
   - Enter amount in ORX
   - Confirm transaction

---

## 🔍 Verifying Your ORX Balance

### In the App:
- Go to `/faucet` page - shows balance at top
- Go to `/staking` page - shows available ORX
- Check your `/portfolio` - displays ORX holdings

### In MetaMask:
1. Add ORX token (if not visible):
   - Click "Import Tokens"
   - Paste address: `0x7eE4f73bab260C11c68e5560c46E3975E824ed79`
   - Symbol and decimals auto-fill
   
2. Balance appears in your token list

### On BSCScan:
- Visit: https://testnet.bscscan.com/token/0x7eE4f73bab260C11c68e5560c46E3975E824ed79
- Enter your wallet address in search
- See ORX balance and transaction history

---

## 🎯 What to Do With ORX Tokens

### 1. Stake for Rewards
```
/staking → Stake ORX → Earn rewards
```
- Stake any amount
- Earn rewards for participation
- Unstake anytime

### 2. Vote on Governance
```
/governance → Create or vote on proposals
```
- 1 ORX = 1 vote
- Participate in DAO decisions
- Shape platform future

### 3. Create Prediction Markets
```
/create-market → Stake required ORX
```
- Markets may require ORX stake
- Shows your commitment
- Earns you platform fees

### 4. Bet on Outcomes
```
/markets → Select market → Place prediction
```
- Use ORX to bet on outcomes
- Win = Earn more ORX
- Lose = Try again with faucet!

---

## 🐛 Troubleshooting

### "ORX not showing in MetaMask"
**Solution:** Manually import token
1. Open MetaMask
2. Click "Import Tokens"
3. Paste: `0x7eE4f73bab260C11c68e5560c46E3975E824ed79`
4. Click "Add Custom Token"

### "Please wait X minutes before claiming again"
**Solution:** This is normal cooldown
- Wait 5 minutes between claims
- Prevents faucet abuse
- You can check remaining time on faucet page

### "Faucet is currently empty"
**Solution:** Faucet needs refill
- Contact team in Discord
- Or use Method 2 (manual transfer)
- Faucet usually refilled within 24 hours

### "Transaction failed - insufficient gas"
**Solution:** You need test BNB
1. Go to: https://testnet.bnbchain.org/faucet-smart
2. Enter your wallet address
3. Get free test BNB (0.1 BNB)
4. Try claiming ORX again

### "Wrong network"
**Solution:** Switch to BSC Testnet
1. Open MetaMask
2. Click network dropdown (top)
3. Select "BNB Smart Chain Testnet"
4. If not listed, add manually:
   - Network Name: BSC Testnet
   - RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
   - Chain ID: 97
   - Symbol: BNB
   - Explorer: https://testnet.bscscan.com

---

## 📊 Faucet API (For Developers)

### Claim Tokens
```bash
curl -X POST https://api.oraclex.ai/api/faucet/claim \
  -H "Content-Type: application/json" \
  -d '{"address": "0xYourAddress", "amount": "1000"}'
```

### Check Cooldown
```bash
curl https://api.oraclex.ai/api/faucet/cooldown/0xYourAddress
```

### Get Faucet Info
```bash
curl https://api.oraclex.ai/api/faucet/info
```

---

## 🎓 Best Practices

### For Testing:
1. Start with faucet tokens (free!)
2. Test staking with small amounts first
3. Try governance voting
4. Practice on low-value markets
5. Claim more tokens as needed

### For Development:
1. Use faucet for automated testing
2. Create test wallets easily
3. Don't use real BNB/ORX
4. Reset state by creating new wallets

### Security Notes:
- **Never share private keys**
- These are TEST tokens (no real value)
- Use separate wallet for testing
- Don't send real assets to testnet

---

## 🔗 Quick Links

- **Faucet Page:** `/faucet`
- **Token Contract:** `0x7eE4f73bab260C11c68e5560c46E3975E824ed79`
- **BSCScan:** https://testnet.bscscan.com/token/0x7eE4f73bab260C11c68e5560c46E3975E824ed79
- **BNB Faucet:** https://testnet.bnbchain.org/faucet-smart
- **Discord Support:** discord.gg/oraclex

---

## 💡 Pro Tips

1. **Claim early, claim often** - 5-minute cooldown is short
2. **Keep some BNB** - Always have test BNB for gas
3. **Check balance** - Before each transaction
4. **Use faucet link** - Share with team members
5. **Report issues** - If faucet stops working

Happy testing! 🚀
