# Backend API Server

Node.js + Express + TypeScript API server for OracleX platform.

## Features

- 🔐 Authentication & user management
- 📊 Market data aggregation
- 🤖 AI oracle integration
- 🔗 Blockchain interaction layer
- 📈 Analytics & metrics
- 💾 Database management (PostgreSQL + Redis)

## API Endpoints

### Authentication
- `POST /api/auth/connect` - Connect wallet
- `POST /api/auth/nonce` - Get signing nonce
- `POST /api/auth/verify` - Verify signature

### Markets
- `GET /api/markets` - List all markets
- `POST /api/markets` - Create new market
- `GET /api/markets/:id` - Get market details
- `POST /api/markets/:id/join` - Join market
- `GET /api/markets/:id/analytics` - Market analytics

### Oracles
- `POST /api/oracles/resolve` - Trigger market resolution
- `GET /api/oracles/status` - Oracle system status
- `POST /api/oracles/dispute` - Submit dispute

### Users
- `GET /api/users/profile` - User profile
- `GET /api/users/stats` - User statistics
- `GET /api/users/leaderboard` - Global leaderboard

## Development

```bash
npm install
npm run dev
```

## Environment Variables

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
BLOCKCHAIN_RPC_URL=...
AI_ORACLE_URL=...
```