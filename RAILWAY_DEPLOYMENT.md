# Railway Deployment Guide

## Prerequisites
1. Railway account
2. PostgreSQL database provisioned in Railway
3. Environment variables configured

## Deployment Steps

### 1. Configure Railway Service

In your Railway dashboard:

1. **Set Root Directory**: 
   - Go to Settings → Deploy
   - Set `Root Directory` to `backend`

2. **Configure Build Command**:
   ```bash
   npm install && npx prisma generate && npm run build
   ```

3. **Configure Start Command**:
   ```bash
   npm start
   ```

### 2. Environment Variables

Set these in Railway Settings → Variables:

```env
# Database (automatically provided by Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Node Environment
NODE_ENV=production
PORT=3001

# JWT Configuration
JWT_SECRET=your-production-jwt-secret-here
JWT_EXPIRES_IN=7d

# Blockchain Configuration (BNB Smart Chain Testnet)
BLOCKCHAIN_RPC_URL=https://bsc-testnet-rpc.publicnode.com
BSC_RPC_URL=https://bsc-testnet-rpc.publicnode.com
PRIVATE_KEY=your-private-key-here

# Contract Addresses
ORX_TOKEN_ADDRESS=0x7eE4f73bab260C11c68e5560c46E3975E824ed79
ORACLE_BRIDGE_ADDRESS=0x7CeE510d9080379738B3D9870C4C046d9a891E7F
AI_ORACLE_ADDRESS=0xC7FBa4a30396CC6F7fD107c165eA29E4bc62314d
STAKING_CONTRACT_ADDRESS=0x007Aaa957829ea04e130809e9cebbBd4d06dABa2
DISPUTE_CONTRACT_ADDRESS=0x5fd54e5e037939C93fAC248E39459b168d741502
GOVERNANCE_CONTRACT_ADDRESS=0x0b88B36631911efeBe9Dd6395Fb6DA635B1EfF8F
DISPUTE_RESOLUTION_ADDRESS=0x5fd54e5e037939C93fAC248E39459b168d741502
MARKET_FACTORY_ADDRESS=0x273C8Dde70897069BeC84394e235feF17e7c5E1b

# Blockchain Sync
DEPLOYMENT_BLOCK=71445000
ENABLE_BLOCKCHAIN_SYNC=true
ENABLE_HISTORICAL_SYNC=false

# Redis (optional - can provision in Railway)
REDIS_URL=${{Redis.REDIS_URL}}

# AI Oracle Configuration
AI_ORACLE_URL=your-ai-oracle-url-here
OPENAI_API_KEY=your-openai-key-here

# Frontend Configuration
FRONTEND_URL=your-frontend-url-here

# Security Configuration
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Monitoring Configuration
LOG_LEVEL=info
```

### 3. Database Setup

After deployment, run migrations:

```bash
# In Railway terminal or using Railway CLI
npx prisma migrate deploy
```

Or use the Railway CLI locally:
```bash
railway link
railway run npx prisma migrate deploy
```

### 4. Verify Deployment

Check these endpoints:
- `https://your-app.railway.app/health` - Health check
- `https://your-app.railway.app/api/markets` - Markets API
- `https://your-app.railway.app/api/analytics/overview` - Analytics

## Troubleshooting

### Prisma Client Error
If you see `@prisma/client did not initialize yet`:
- Ensure `postinstall` script runs: `"postinstall": "prisma generate"`
- Check build logs to verify `npx prisma generate` ran successfully

### Database Connection Error
- Verify `DATABASE_URL` is set correctly
- Ensure PostgreSQL service is running
- Check if migrations were applied

### Build Failures
- Check TypeScript compilation errors
- Verify all dependencies are installed
- Review build logs in Railway dashboard

### Runtime Errors
- Check application logs in Railway
- Verify all environment variables are set
- Ensure blockchain RPC URLs are accessible

## Monorepo Deployment

Since this is a monorepo, you have two options:

### Option 1: Set Root Directory (Recommended)
- Settings → Deploy → Root Directory: `backend`
- Railway will only deploy the backend workspace

### Option 2: Deploy from Subdirectory
Use the provided `nixpacks.toml` and `railway.json` configurations

## Database Migrations

### Initial Migration
```bash
railway run npx prisma migrate deploy
```

### Future Migrations
1. Create migration locally: `npm run db:migrate`
2. Commit migration files in `prisma/migrations/`
3. Push to repository
4. Railway will auto-deploy
5. Run: `railway run npx prisma migrate deploy`

## Scaling

Railway automatically scales based on:
- CPU usage
- Memory usage
- Request volume

Monitor in Railway dashboard → Metrics

## Logs

View logs:
- Railway Dashboard → Deployments → Logs
- Or use CLI: `railway logs`

## CI/CD

Railway automatically deploys when you push to your connected branch (usually `main`).

To disable auto-deploy:
- Settings → Deploy → Enable Auto Deploy: OFF

## Cost Optimization

1. Use Hobby plan for development
2. Upgrade to Pro for production
3. Monitor resource usage
4. Optimize database queries
5. Use Redis for caching

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/abdussalam-mustapha/OracleX/issues
