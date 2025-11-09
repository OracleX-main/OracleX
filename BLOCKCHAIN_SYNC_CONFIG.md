# Blockchain Sync Configuration

## Overview

The OracleX backend includes an optional blockchain synchronization service that listens to events from the BSC smart contracts and syncs data to the PostgreSQL database. This service is **optional** and the backend will run without it.

## Environment Variables

### Required for Blockchain Sync

To enable blockchain synchronization, set these environment variables:

```bash
# Enable/disable blockchain sync (default: true)
ENABLE_BLOCKCHAIN_SYNC=true

# Smart contract addresses
MARKET_FACTORY_ADDRESS=0x0b88B36631911efeBe9Dd6395Fb6DA635B1EfF8F

# BSC RPC endpoints (optional, has fallbacks)
BSC_RPC_URL=https://bsc-testnet-rpc.publicnode.com
```

### Fallback Behavior

If `MARKET_FACTORY_ADDRESS` is not set, the backend will:
- ✅ Start successfully
- ✅ Serve all API endpoints
- ⚠️ Skip blockchain synchronization
- 💡 Log informational messages about disabled sync

## Railway Deployment

### Option 1: Database-Only Mode (Recommended for initial deployment)

Don't set `MARKET_FACTORY_ADDRESS` in Railway environment variables. The backend will run in database-only mode.

**Railway Environment Variables:**
```
DATABASE_URL=postgresql://... (Railway PostgreSQL)
NODE_ENV=production
PORT=3001
```

### Option 2: Full Blockchain Integration

Add all blockchain environment variables in Railway:

**Railway Environment Variables:**
```
DATABASE_URL=postgresql://... (Railway PostgreSQL)
NODE_ENV=production
PORT=3001
ENABLE_BLOCKCHAIN_SYNC=true
MARKET_FACTORY_ADDRESS=0x0b88B36631911efeBe9Dd6395Fb6DA635B1EfF8F
BSC_RPC_URL=https://bsc-testnet-rpc.publicnode.com
```

## Local Development

For local development, create a `.env` file in the `backend/` directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/oraclex"

# Blockchain (optional)
ENABLE_BLOCKCHAIN_SYNC=true
MARKET_FACTORY_ADDRESS=0x0b88B36631911efeBe9Dd6395Fb6DA635B1EfF8F
BSC_RPC_URL=https://bsc-testnet-rpc.publicnode.com

# Other settings
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-key
```

## Logs

### Blockchain Sync Enabled
```
🚀 OracleX Backend API running on port 3001
📊 Environment: production
🔗 Database: Connected
✅ Blockchain sync service started
```

### Blockchain Sync Disabled (No MARKET_FACTORY_ADDRESS)
```
🚀 OracleX Backend API running on port 3001
📊 Environment: production
🔗 Database: Connected
📴 Blockchain sync disabled: MARKET_FACTORY_ADDRESS not configured
💡 Backend running in database-only mode
```

### Blockchain Sync Error
```
🚀 OracleX Backend API running on port 3001
📊 Environment: production
🔗 Database: Connected
Failed to start blockchain sync service: Error: ...
⚠️ Backend running without blockchain sync
```

## Troubleshooting

### Backend crashes on start with "MARKET_FACTORY_ADDRESS not set"

**Solution:** The blockchain sync service has been updated to be optional. Redeploy with the latest code.

### Blockchain events not syncing

**Possible causes:**
1. `ENABLE_BLOCKCHAIN_SYNC` is set to `false`
2. `MARKET_FACTORY_ADDRESS` is not set
3. RPC endpoint is down or rate-limited
4. Smart contract is not deployed at the specified address

**Check logs for:**
- "Blockchain sync disabled" messages
- RPC connection errors
- Contract address validation errors

### Railway deployment fails

**Common issues:**
1. Missing `DATABASE_URL` - add PostgreSQL plugin
2. Build errors - check `npm run build` locally
3. Prisma client not generated - postinstall script should handle this

## Architecture

### Lazy Loading

The blockchain sync service is **lazy-loaded** to prevent startup crashes:

```typescript
// Only loads if MARKET_FACTORY_ADDRESS is set
if (enableBlockchainSync && process.env.MARKET_FACTORY_ADDRESS) {
  const { getBlockchainSyncService } = await import('./services/blockchainSync');
  blockchainSyncService = getBlockchainSyncService();
  await blockchainSyncService.start();
}
```

### Graceful Degradation

The backend provides full API functionality even without blockchain sync:
- ✅ Market creation via API
- ✅ User authentication
- ✅ Analytics endpoints
- ✅ Staking/Governance routes
- ⚠️ No automatic blockchain event syncing

## Best Practices

1. **Start with database-only mode** - Deploy to Railway without blockchain config first
2. **Test the API** - Verify all endpoints work before enabling blockchain sync
3. **Add blockchain config** - Once stable, add `MARKET_FACTORY_ADDRESS` environment variable
4. **Monitor logs** - Check Railway logs for sync errors or RPC issues
5. **Use fallback RPCs** - The service tries multiple BSC RPC endpoints automatically

## Support

For issues or questions:
- Check Railway logs: `railway logs`
- Review environment variables in Railway dashboard
- Ensure smart contracts are deployed on BSC Testnet
- Verify RPC endpoints are accessible
