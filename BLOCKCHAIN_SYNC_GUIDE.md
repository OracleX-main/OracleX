# Blockchain Sync Service Configuration Guide

## Overview
The blockchain sync service automatically syncs market events from the BSC blockchain to your local database. It has been optimized to avoid rate limiting issues.

---

## Default Behavior (Recommended)

By default, the service **only listens for NEW events** going forward:

```env
ENABLE_HISTORICAL_SYNC="false"  # Default
```

**What this means:**
- ✅ No rate limit errors
- ✅ Backend starts instantly
- ✅ New markets created after backend starts will sync automatically
- ❌ Markets created before backend starts won't be imported

**Best for:**
- Development with fresh database
- Testing new market creation
- Avoiding RPC rate limits

---

## Historical Sync (Optional)

If you need to import markets that were created before the backend started:

```env
ENABLE_HISTORICAL_SYNC="true"
DEPLOYMENT_BLOCK="71445000"  # Block when contracts were deployed
```

**What this means:**
- ✅ Imports all past MarketCreated events
- ✅ Syncs in chunks to avoid rate limits (2000 blocks at a time)
- ✅ Resumes from last synced block if interrupted
- ⚠️ Takes longer to start (depends on block range)
- ⚠️ May still hit rate limits with very large block ranges

**Best for:**
- Production deployment
- Migrating existing markets to database
- Full historical data

---

## Configuration Options

### Environment Variables

```env
# Required
BSC_RPC_URL="https://data-seed-prebsc-1-s1.binance.org:8545"
MARKET_FACTORY_ADDRESS="0x273C8Dde70897069BeC84394e235feF17e7c5E1b"

# Optional
ENABLE_HISTORICAL_SYNC="false"  # Set to "true" to enable
DEPLOYMENT_BLOCK="71445000"     # Starting block for historical sync
```

### Sync Strategy

**No existing markets in DB:**
- Syncs only last 10,000 blocks (~8 hours on BSC)
- Catches recent events without overwhelming RPC

**Has existing markets in DB:**
- Syncs from last known market timestamp
- Automatically calculates starting block

---

## How It Works

### Real-time Event Listening

Always enabled, regardless of historical sync setting:

```typescript
// Listens for these events:
- MarketCreated → Creates market in DB
- PredictionPlaced → Records bet in DB  
- MarketResolved → Updates market status
```

### Historical Sync Process

When enabled:

```
1. Calculate block range to sync
2. Split into 2000-block chunks
3. Query each chunk with 100ms delay
4. Process all events sequentially
5. Start listening for new events
```

---

## Testing the Sync Service

### 1. Check Backend Logs

**Expected output (historical sync disabled):**
```
✅ Blockchain sync service started
📝 Historical sync disabled. Only listening for new events.
🎧 Listening for blockchain events...
```

**Expected output (historical sync enabled):**
```
🔄 Starting blockchain sync service...
📊 Syncing from block 71445000 to 71446500
🔍 Large block range detected. Syncing in chunks...
📦 Synced blocks 71445000 to 71447000 - Found 1 events
📦 Synced blocks 71447001 to 71449000 - Found 0 events
✅ Found 1 MarketCreated events total
💾 Market created in database: xyz...
✅ Historical data sync completed
🎧 Listening for blockchain events...
```

### 2. Create Test Market

Create a market through the UI or API:

```bash
# Watch backend logs for:
"New MarketCreated event: Market ID X"
"Market created in database: abc..."
```

### 3. Verify in Database

```bash
cd backend
npx prisma studio

# Check tables:
- Market (should show your new market)
- Outcome (should show YES/NO outcomes)
- Prediction (will show bets when placed)
```

---

## Troubleshooting

### Rate Limit Errors

**Error:**
```
Error: method eth_getLogs in batch triggered rate limit
```

**Solutions:**
1. Set `ENABLE_HISTORICAL_SYNC="false"` (recommended)
2. Use alternative RPC endpoint:
   ```env
   BSC_RPC_URL="https://bsc-testnet.public.blastapi.io"
   ```
3. Reduce block range:
   ```env
   DEPLOYMENT_BLOCK="71445000"  # Use recent block
   ```

### Events Not Syncing

**Check:**
1. ✅ Backend is running
2. ✅ `MARKET_FACTORY_ADDRESS` is correct
3. ✅ RPC URL is accessible
4. ✅ Events are being emitted on blockchain

**Test:**
```bash
# Create market in UI
# Check backend logs immediately
# Should see "New MarketCreated event" within 3-6 seconds
```

### Database Connection Issues

**Error:**
```
Failed to start blockchain sync service
```

**Solutions:**
1. Run migrations: `npx prisma migrate dev`
2. Check `DATABASE_URL` in .env
3. Verify Prisma client is generated: `npx prisma generate`

---

## Performance Tuning

### Reduce Chunk Size (if still hitting rate limits)

```typescript
// In blockchainSync.ts
const CHUNK_SIZE = 1000;  // Reduced from 2000
```

### Increase Delay Between Chunks

```typescript
// In blockchainSync.ts
await new Promise(resolve => setTimeout(resolve, 500));  // Increased from 100ms
```

### Use Premium RPC Provider

Free RPC endpoints have strict rate limits. Consider:
- **QuickNode** - https://www.quicknode.com/
- **Alchemy** - https://www.alchemy.com/
- **Infura** - https://www.infura.io/

```env
BSC_RPC_URL="https://your-premium-rpc-endpoint.com/YOUR_KEY"
```

---

## Production Recommendations

1. **Enable historical sync on first deployment only:**
   ```env
   ENABLE_HISTORICAL_SYNC="true"  # First time
   ```

2. **After initial sync, disable it:**
   ```env
   ENABLE_HISTORICAL_SYNC="false"  # After markets imported
   ```

3. **Use premium RPC for better reliability:**
   ```env
   BSC_RPC_URL="https://premium-endpoint.com/key"
   ```

4. **Set up database backups:**
   - Regular backups prevent need to re-sync
   - Much faster to restore DB than re-sync blockchain

5. **Monitor sync service logs:**
   - Set up alerts for sync failures
   - Track event processing latency

---

## Manual Sync (Emergency)

If you need to manually trigger a sync:

1. **Enable historical sync:**
   ```env
   ENABLE_HISTORICAL_SYNC="true"
   ```

2. **Set specific block range:**
   ```env
   DEPLOYMENT_BLOCK="71445000"  # Your target start block
   ```

3. **Restart backend:**
   ```bash
   npm run dev
   ```

4. **Monitor logs** for completion

5. **Disable after complete:**
   ```env
   ENABLE_HISTORICAL_SYNC="false"
   ```

---

## Summary

✅ **Current Setup (Recommended):**
- Historical sync: **DISABLED**
- Real-time listening: **ENABLED**
- Rate limits: **AVOIDED**
- New markets: **AUTO-SYNCED**

💡 **Key Point:**
Markets created through your UI will always sync automatically, regardless of historical sync setting. Historical sync is only needed for importing markets created before backend started.

---

**Last Updated:** 2025-11-06  
**Status:** ✅ Working - No rate limit errors
