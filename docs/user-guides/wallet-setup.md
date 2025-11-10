# Wallet Setup Guide

Complete guide to setting up your wallet for OracleX on BNB Smart Chain Testnet.

##  Overview

To use OracleX, you need a Web3 wallet to:
- Connect to the platform
- Sign transactions
- Store ORX tokens
- Manage your predictions

**Recommended Wallet**: MetaMask (most widely supported)

##  Installing MetaMask

### Browser Extension (Desktop)

#### Step 1: Download MetaMask

1. Visit **official website**: https://metamask.io
2. Click **"Download"**
3. Select your browser:
   - Chrome
   - Firefox
   - Brave
   - Edge
4. Click **"Install MetaMask"**
5. Add extension to browser

#### Step 2: Create New Wallet

1. Open MetaMask extension
2. Click **"Get Started"**
3. Select **"Create a new wallet"**
4. Agree to terms
5. Create a strong password (min 8 characters)
6. Watch the security video (optional but recommended)

#### Step 3: Secure Your Seed Phrase

 **CRITICAL: Your seed phrase is the master key to your wallet**

1. Click **"Reveal Secret Recovery Phrase"**
2. Write down all 12 words **on paper** (in exact order)
3. Store paper in a secure location
4. **Never** share with anyone
5. **Never** store digitally (no screenshots, no cloud)
6. Complete the confirmation test

**Example Seed Phrase:**
```
word1 word2 word3 word4 word5 word6 
word7 word8 word9 word10 word11 word12
```

### Mobile App

#### iOS (iPhone/iPad)

1. Open **App Store**
2. Search **"MetaMask"**
3. Install app by MetaMask
4. Open app
5. Follow same creation steps as desktop

#### Android

1. Open **Google Play Store**
2. Search **"MetaMask"**
3. Install app by MetaMask
4. Open app
5. Follow same creation steps as desktop

##  Adding BNB Smart Chain Testnet

MetaMask defaults to Ethereum. You need to add BNB Chain Testnet for OracleX.

### Method 1: Automatic (Recommended)

1. Visit OracleX: https://oraclex.com
2. Click **"Connect Wallet"**
3. MetaMask will prompt to add network
4. Click **"Approve"** then **"Switch network"**

### Method 2: Manual Setup

#### Step 1: Open Network Settings

1. Open MetaMask
2. Click network dropdown (top of extension)
3. Click **"Add network"**
4. Click **"Add a network manually"**

#### Step 2: Enter Network Details

Fill in the following information:

| Field | Value |
|-------|-------|
| **Network Name** | BNB Smart Chain Testnet |
| **RPC URL** | `https://bsc-testnet-rpc.publicnode.com` |
| **Chain ID** | `97` |
| **Currency Symbol** | `tBNB` |
| **Block Explorer** | `https://testnet.bscscan.com` |

#### Step 3: Save and Switch

1. Click **"Save"**
2. MetaMask automatically switches to new network
3. You should see "BNB Smart Chain Testnet" at top

### Alternative RPC URLs

If the primary RPC is slow, try these alternatives:

```
https://data-seed-prebsc-1-s1.bnbchain.org:8545
https://data-seed-prebsc-2-s1.bnbchain.org:8545
https://bsc-testnet.public.blastapi.io
```

##  Getting Test BNB

You need BNB for gas fees (transaction costs).

### Using BNB Chain Faucet

1. Visit: https://testnet.bnbchain.org/faucet-smart
2. Connect your MetaMask wallet
3. Complete reCAPTCHA
4. Click **"Give me BNB"**
5. Wait 30-60 seconds
6. Check MetaMask balance (~0.1 tBNB received)

**Faucet Limits:**
- Amount: 0.1 tBNB per request
- Cooldown: 24 hours
- Daily limit: May vary

### Alternative Faucets

If the official faucet is down:

1. **Alchemy BNB Faucet**: https://www.alchemy.com/faucets/bnb-smart-chain-testnet
2. **QuickNode Faucet**: https://faucet.quicknode.com/binance-smart-chain/bnb-testnet

##  Adding ORX Token to MetaMask

Once you have test BNB, add ORX token to view your balance.

### Method 1: Automatic Import

1. Visit OracleX faucet: https://oraclex.com/faucet
2. Claim 1,000 ORX
3. MetaMask may auto-detect the token
4. Click **"Add token"** in notification

### Method 2: Manual Import

#### Step 1: Open Token Settings

1. Open MetaMask
2. Ensure you're on BNB Testnet
3. Scroll down to bottom
4. Click **"Import tokens"**

#### Step 2: Enter Token Details

1. Select **"Custom token"** tab
2. Enter token contract address:
   ```
   0x7eE4f73bab260C11c68e5560c46E3975E824ed79
   ```
3. Token symbol and decimals auto-fill:
   - Symbol: `ORX`
   - Decimals: `18`
4. Click **"Add custom token"**
5. Click **"Import tokens"**

#### Step 3: Verify

You should now see:
- ORX token in your asset list
- Current balance (0 if you haven't claimed yet)

##  Connecting to OracleX

### First Time Connection

1. Go to https://oraclex.com
2. Click **"Connect Wallet"** (top right)
3. Select **"MetaMask"**
4. MetaMask popup appears
5. Select account to connect
6. Click **"Next"**
7. Click **"Connect"**
8. May ask to switch to BNB Testnet (click "Switch")

### Account Display

Once connected, you'll see:
- Your wallet address (shortened): `0x1234...5678`
- ORX balance
- Account avatar/icon

### Disconnecting

1. Click your address (top right)
2. Click **"Disconnect"**

Or from MetaMask:
1. Open MetaMask
2. Click three dots (top right)
3. Select **"Connected sites"**
4. Find OracleX
5. Click **"Disconnect"**

##  Security Best Practices

### Seed Phrase Security

 **DO:**
- Write on paper and store securely
- Use a hardware wallet for large amounts
- Create multiple backups in different locations
- Use a password manager with encryption
- Consider metal seed phrase backup

 **DON'T:**
- Screenshot or save digitally
- Share with anyone (even "support")
- Store in cloud (Google Drive, Dropbox, etc.)
- Email to yourself
- Save in browser notes

### Transaction Safety

 **DO:**
- Always verify contract addresses
- Check transaction details before signing
- Start with small test amounts
- Use hardware wallet for large sums
- Enable MetaMask security alerts

 **DON'T:**
- Sign unknown transactions
- Connect to suspicious websites
- Share your private key
- Ignore security warnings
- Rush through transaction confirmations

### Phishing Protection

 **Common Phishing Tactics:**

1. **Fake websites**: Always check URL (https://oraclex.com)
2. **Impersonation**: Official team never DMs first
3. **Urgent messages**: "Act now or lose funds"
4. **Fake support**: We never ask for seed phrases
5. **Airdrop scams**: Too good to be true offers

 **Protection Steps:**

- Bookmark official site
- Verify social media accounts
- Check contract addresses on BSCScan
- Enable 2FA where available
- Report suspicious activity

##  Troubleshooting

### "Wrong Network" Error

**Problem**: MetaMask is on wrong network

**Solution**:
1. Open MetaMask
2. Click network dropdown
3. Select "BNB Smart Chain Testnet"
4. If not listed, add manually (see above)

### "Insufficient Funds" Error

**Problem**: Not enough BNB for gas

**Solution**:
1. Get test BNB from faucet
2. Wait for transaction to confirm
3. Check balance in MetaMask
4. Try transaction again

### "Transaction Failed"

**Problem**: Transaction reverted

**Possible causes**:
- Insufficient gas
- Contract error
- Slippage too low
- Approval needed first

**Solution**:
1. Check error message in MetaMask
2. Ensure sufficient BNB for gas
3. Try increasing gas limit
4. Check if token approval needed

### Can't Connect Wallet

**Problem**: MetaMask won't connect

**Solution**:
1. Refresh page
2. Lock/unlock MetaMask
3. Clear browser cache
4. Try different browser
5. Reinstall MetaMask (last resort - have seed phrase ready!)

### Token Not Showing

**Problem**: ORX balance is 0 or not visible

**Solution**:
1. Verify you're on BNB Testnet
2. Check if token imported correctly
3. Verify contract address
4. Check balance on BSCScan
5. Refresh MetaMask

### Pending Transaction Stuck

**Problem**: Transaction pending for too long

**Solution**:
1. Click pending transaction
2. Click **"Speed Up"** or **"Cancel"**
3. Pay higher gas fee
4. Wait for confirmation

Or reset account:
1. MetaMask Settings
2. Advanced
3. Reset Account (clears pending transactions)

##  Advanced: Hardware Wallets

For holding significant ORX amounts, use a hardware wallet.

### Supported Hardware Wallets

- **Ledger** (Nano S, Nano X, Nano S Plus)
- **Trezor** (Model One, Model T)

### Connecting Ledger

1. Install Ledger Live app
2. Connect Ledger device
3. Install Binance Smart Chain app on device
4. Open MetaMask
5. Click account icon
6. Select **"Connect Hardware Wallet"**
7. Choose **"Ledger"**
8. Follow prompts

### Connecting Trezor

1. Install Trezor Suite
2. Connect Trezor device
3. Enable BNB Chain support
4. Open MetaMask
5. Click account icon
6. Select **"Connect Hardware Wallet"**
7. Choose **"Trezor"**
8. Follow prompts

##  Multi-Chain Support (Future)

OracleX currently supports BNB Chain Testnet. Mainnet and other chains coming soon:

-  BNB Chain Testnet (Current)
-  BNB Chain Mainnet
-  Ethereum
-  Polygon
-  Arbitrum

##  Additional Resources

- **MetaMask Support**: https://support.metamask.io
- **BNB Chain Docs**: https://docs.bnbchain.org
- **BSCScan Testnet**: https://testnet.bscscan.com
- **OracleX Discord**: https://discord.gg/oraclex

## Next Steps

Now that your wallet is set up:

1.  [Get Your First ORX ](getting-orx.md)
2.  [Make Your First Prediction ](making-predictions.md)
3.  [Stake ORX for Rewards ](staking-guide.md)

---

<div style="background: linear-gradient(135deg, #FFD700, #9333EA); padding: 1.5rem; border-radius: 12px; color: white;">
  <strong> Wallet Ready!</strong> You're all set to start using OracleX. Remember to keep your seed phrase safe and never share it with anyone!
</div>

