# Backend API Reference

Complete API documentation for the OracleX backend service.

##  Base URL

**Development**: `http://localhost:3001/api`  
**Production**: `https://api.oraclex.com/api`

##  Authentication

Most endpoints require JWT authentication.

### Getting Auth Token

```typescript
// Connect wallet and sign message
POST /auth/connect
Request:
{
  "address": "0x1234...",
  "signature": "0xabcd...",
  "message": "Sign this message to authenticate"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "address": "0x1234...",
    "username": "OracleUser"
  }
}
```

### Using Auth Token

Include in headers:
```typescript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

##  Markets Endpoints

### GET /markets

Get list of all markets with filtering and pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |
| `status` | string | all | `active`, `pending`, `resolved`, `all` |
| `category` | string | all | Market category or `all` |
| `sort` | string | createdAt | `createdAt`, `volume`, `endTime`, `trending` |
| `search` | string | - | Search in question text |

**Example Request:**
```typescript
GET /markets?page=1&limit=10&status=active&category=crypto&sort=volume

Response: 200 OK
{
  "markets": [
    {
      "id": "market-123",
      "question": "Will Bitcoin reach $100k in 2025?",
      "category": "crypto",
      "status": "active",
      "creatorAddress": "0x1234...",
      "endTime": "2025-12-31T23:59:59Z",
      "resolutionSource": "CoinGecko",
      "totalVolume": "45000000000000000000", // 45 ORX in wei
      "outcomes": [
        {
          "id": "outcome-1",
          "name": "YES",
          "totalStaked": "30000000000000000000", // 30 ORX
          "probability": 0.67
        },
        {
          "id": "outcome-2",
          "name": "NO",
          "totalStaked": "15000000000000000000", // 15 ORX
          "probability": 0.33
        }
      ],
      "participantCount": 42,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}
```

### GET /markets/:id

Get detailed information about a specific market.

**Path Parameters:**
- `id` - Market ID

**Example Request:**
```typescript
GET /markets/market-123

Response: 200 OK
{
  "id": "market-123",
  "question": "Will Bitcoin reach $100k in 2025?",
  "description": "Market resolves based on CoinGecko price...",
  "category": "crypto",
  "status": "active",
  "creator": {
    "address": "0x1234...",
    "username": "CryptoOracle",
    "reputation": 850
  },
  "endTime": "2025-12-31T23:59:59Z",
  "resolutionSource": "https://www.coingecko.com/en/coins/bitcoin",
  "resolutionCriteria": "Bitcoin USD price >= $100,000",
  "totalVolume": "45000000000000000000",
  "outcomes": [
    {
      "id": "outcome-1",
      "name": "YES",
      "totalStaked": "30000000000000000000",
      "stakersCount": 25,
      "probability": 0.67,
      "impliedOdds": "1.5:1"
    },
    {
      "id": "outcome-2",
      "name": "NO",
      "totalStaked": "15000000000000000000",
      "stakersCount": 17,
      "probability": 0.33,
      "impliedOdds": "3:1"
    }
  ],
  "participantCount": 42,
  "aiAnalysis": {
    "prediction": "YES",
    "confidence": 0.75,
    "factors": ["Historical trends", "Market sentiment", "Technical analysis"],
    "dataSource": "TruthMesh AI"
  },
  "recentActivity": [
    {
      "user": "0xabcd...",
      "outcome": "YES",
      "amount": "1000000000000000000", // 1 ORX
      "timestamp": "2025-11-10T12:00:00Z"
    }
  ],
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-11-10T12:00:00Z"
}
```

### POST /markets

Create a new prediction market.

**Authentication:** Required

**Request Body:**
```typescript
{
  "question": "Will Bitcoin reach $100k in 2025?",
  "description": "Market resolves based on CoinGecko price at UTC midnight on Dec 31, 2025",
  "category": "crypto",
  "endTime": "2025-12-31T23:59:59Z",
  "resolutionSource": "https://www.coingecko.com/en/coins/bitcoin",
  "resolutionCriteria": "Bitcoin USD price >= $100,000",
  "outcomes": ["YES", "NO"], // or multiple outcomes
  "txHash": "0x..." // Transaction hash from blockchain
}

Response: 201 Created
{
  "id": "market-124",
  "question": "Will Bitcoin reach $100k in 2025?",
  "status": "active",
  "creatorAddress": "0x1234...",
  "createdAt": "2025-11-10T12:00:00Z"
}
```

### GET /markets/:id/predictions

Get all predictions for a specific market.

**Path Parameters:**
- `id` - Market ID

**Query Parameters:**
- `outcome` - Filter by outcome ID
- `page` - Page number
- `limit` - Items per page

**Example Request:**
```typescript
GET /markets/market-123/predictions?outcome=outcome-1&page=1&limit=20

Response: 200 OK
{
  "predictions": [
    {
      "id": "pred-1",
      "userAddress": "0xabcd...",
      "username": "Predictor123",
      "outcomeId": "outcome-1",
      "outcomeName": "YES",
      "amount": "1000000000000000000",
      "timestamp": "2025-11-10T12:00:00Z",
      "txHash": "0x..."
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

##  Users Endpoints

### GET /users/:address

Get user profile and statistics.

**Path Parameters:**
- `address` - User wallet address

**Example Request:**
```typescript
GET /users/0x1234...

Response: 200 OK
{
  "address": "0x1234...",
  "username": "OracleUser",
  "avatar": "https://api.dicebear.com/7.x/identicon/svg?seed=0x1234",
  "bio": "Crypto enthusiast and prediction market expert",
  "reputation": 850,
  "level": 15,
  "badges": ["early_adopter", "10_win_streak", "top_100"],
  "stats": {
    "totalPredictions": 150,
    "correctPredictions": 102,
    "winRate": 0.68,
    "totalStaked": "50000000000000000000",
    "totalWinnings": "75000000000000000000",
    "netProfit": "25000000000000000000",
    "roi": 0.50,
    "marketsCreated": 5,
    "activePredictions": 12
  },
  "joinedAt": "2025-01-01T00:00:00Z"
}
```

### GET /users/:address/predictions

Get user's prediction history.

**Path Parameters:**
- `address` - User wallet address

**Query Parameters:**
- `status` - `active`, `won`, `lost`, `all`
- `page` - Page number
- `limit` - Items per page

**Example Request:**
```typescript
GET /users/0x1234.../predictions?status=active&page=1&limit=10

Response: 200 OK
{
  "predictions": [
    {
      "id": "pred-1",
      "market": {
        "id": "market-123",
        "question": "Will Bitcoin reach $100k in 2025?",
        "status": "active",
        "endTime": "2025-12-31T23:59:59Z"
      },
      "outcome": "YES",
      "amount": "1000000000000000000",
      "currentValue": "1500000000000000000",
      "unrealizedPnL": "500000000000000000",
      "timestamp": "2025-11-10T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

### PUT /users/:address/profile

Update user profile.

**Authentication:** Required (must be profile owner)

**Request Body:**
```typescript
{
  "username": "NewUsername",
  "bio": "Updated bio text",
  "avatar": "https://new-avatar-url.com/image.png"
}

Response: 200 OK
{
  "address": "0x1234...",
  "username": "NewUsername",
  "bio": "Updated bio text",
  "avatar": "https://new-avatar-url.com/image.png"
}
```

##  Analytics Endpoints

### GET /analytics/overview

Get platform-wide analytics overview.

**Example Request:**
```typescript
GET /analytics/overview

Response: 200 OK
{
  "totalVolume": "2400000000000000000000", // $2.4M in ORX
  "totalUsers": 12000,
  "totalMarkets": 450,
  "activemarkets": 120,
  "totalPredictions": 45000,
  "averageAccuracy": 0.68,
  "volumeChange24h": 0.15, // +15%
  "userGrowth24h": 0.05, // +5%
  "topCategories": [
    { "category": "crypto", "volume": "800000000000000000000", "count": 150 },
    { "category": "sports", "volume": "600000000000000000000", "count": 120 }
  ]
}
```

### GET /analytics/markets/trending

Get trending markets.

**Query Parameters:**
- `timeframe` - `24h`, `7d`, `30d`, `all`
- `limit` - Number of results (default 10, max 50)

**Example Request:**
```typescript
GET /analytics/markets/trending?timeframe=24h&limit=10

Response: 200 OK
{
  "markets": [
    {
      "id": "market-123",
      "question": "Will Bitcoin reach $100k in 2025?",
      "volume24h": "15000000000000000000",
      "volumeChange": 0.50,
      "participants24h": 45,
      "trendingScore": 95
    }
  ]
}
```

### GET /analytics/leaderboard

Get user leaderboard.

**Query Parameters:**
- `timeframe` - `daily`, `weekly`, `monthly`, `all_time`
- `sortBy` - `winnings`, `win_rate`, `reputation`, `volume`
- `page` - Page number
- `limit` - Items per page

**Example Request:**
```typescript
GET /analytics/leaderboard?timeframe=weekly&sortBy=winnings&limit=100

Response: 200 OK
{
  "leaderboard": [
    {
      "rank": 1,
      "address": "0x1234...",
      "username": "OracleKing",
      "avatar": "https://...",
      "totalWinnings": "10000000000000000000",
      "winRate": 0.75,
      "reputation": 950,
      "level": 25
    }
  ],
  "pagination": {
    "total": 500,
    "page": 1,
    "limit": 100,
    "pages": 5
  }
}
```

##  Staking Endpoints

### GET /staking/pools

Get staking pool information.

**Example Request:**
```typescript
GET /staking/pools

Response: 200 OK
{
  "pools": [
    {
      "lockPeriod": 2592000, // 30 days in seconds
      "apy": 0.05,
      "totalStaked": "50000000000000000000000",
      "stakersCount": 500,
      "rewardsRemaining": "10000000000000000000000"
    },
    {
      "lockPeriod": 7776000, // 90 days
      "apy": 0.144,
      "totalStaked": "80000000000000000000000",
      "stakersCount": 350,
      "rewardsRemaining": "15000000000000000000000"
    }
  ]
}
```

### GET /staking/user/:address

Get user's staking positions.

**Path Parameters:**
- `address` - User wallet address

**Example Request:**
```typescript
GET /staking/user/0x1234...

Response: 200 OK
{
  "stakes": [
    {
      "id": "stake-1",
      "amount": "5000000000000000000000",
      "lockPeriod": 7776000,
      "startTime": "2025-01-01T00:00:00Z",
      "unlockTime": "2025-04-01T00:00:00Z",
      "apy": 0.144,
      "earnedRewards": "720000000000000000000",
      "status": "active",
      "txHash": "0x..."
    }
  ],
  "totalStaked": "5000000000000000000000",
  "totalRewards": "720000000000000000000"
}
```

##  Faucet Endpoints

### POST /faucet/claim

Claim test ORX tokens.

**Authentication:** Required

**Request Body:**
```typescript
{
  "address": "0x1234..."
}

Response: 200 OK
{
  "success": true,
  "amount": "1000000000000000000000", // 1,000 ORX
  "txHash": "0x...",
  "nextClaimTime": "2025-11-11T12:00:00Z"
}

Error Response: 429 Too Many Requests
{
  "error": "Already claimed",
  "nextClaimTime": "2025-11-11T12:00:00Z",
  "timeRemaining": 43200 // seconds
}
```

### GET /faucet/status/:address

Check faucet claim status for address.

**Path Parameters:**
- `address` - User wallet address

**Example Request:**
```typescript
GET /faucet/status/0x1234...

Response: 200 OK
{
  "canClaim": false,
  "lastClaimTime": "2025-11-10T12:00:00Z",
  "nextClaimTime": "2025-11-11T12:00:00Z",
  "timeRemaining": 43200,
  "totalClaimed": "5000000000000000000000" // 5,000 ORX total
}
```

##  WebSocket Events

Connect to WebSocket for real-time updates.

**URL**: `ws://localhost:3001` (dev) or `wss://api.oraclex.com` (prod)

### Events to Listen

```typescript
// New prediction made
socket.on('prediction:new', (data) => {
  console.log('New prediction:', data);
  // { marketId, userAddress, outcome, amount, timestamp }
});

// Market odds updated
socket.on('market:odds', (data) => {
  console.log('Odds updated:', data);
  // { marketId, outcomes: [{ id, probability }] }
});

// Market resolved
socket.on('market:resolved', (data) => {
  console.log('Market resolved:', data);
  // { marketId, winningOutcome, totalWinners, totalPayout }
});

// User level up
socket.on('user:levelup', (data) => {
  console.log('Level up:', data);
  // { address, newLevel, rewards }
});
```

### Events to Emit

```typescript
// Subscribe to market updates
socket.emit('subscribe:market', { marketId: 'market-123' });

// Unsubscribe
socket.emit('unsubscribe:market', { marketId: 'market-123' });

// Subscribe to user updates
socket.emit('subscribe:user', { address: '0x1234...' });
```

##  Error Handling

### Error Response Format

```typescript
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} // Optional additional details
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid request body |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

### Common Error Codes

```typescript
// Authentication
AUTH_REQUIRED: "Authentication required"
INVALID_TOKEN: "Invalid or expired token"
INVALID_SIGNATURE: "Invalid wallet signature"

// Validation
INVALID_INPUT: "Invalid input parameters"
MISSING_FIELD: "Required field missing"
INVALID_ADDRESS: "Invalid Ethereum address"

// Resource
NOT_FOUND: "Resource not found"
ALREADY_EXISTS: "Resource already exists"

// Rate Limiting
RATE_LIMIT_EXCEEDED: "Too many requests"
FAUCET_COOLDOWN: "Faucet claim on cooldown"

// Business Logic
INSUFFICIENT_BALANCE: "Insufficient ORX balance"
MARKET_ENDED: "Market betting period ended"
INVALID_OUTCOME: "Invalid outcome selection"
```

##  Rate Limiting

API requests are rate-limited per IP address:

| Endpoint Type | Limit |
|---------------|-------|
| **Auth** | 10 requests/minute |
| **Read (GET)** | 100 requests/minute |
| **Write (POST/PUT)** | 20 requests/minute |
| **Faucet** | 1 request/24 hours |
| **WebSocket** | 50 messages/minute |

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699638000
```

##  Testing

### Using curl

```bash
# Get markets
curl -X GET "http://localhost:3001/api/markets?page=1&limit=10"

# Get specific market
curl -X GET "http://localhost:3001/api/markets/market-123"

# Create market (with auth)
curl -X POST "http://localhost:3001/api/markets" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"Will BTC hit $100k?","category":"crypto",...}'
```

### Using JavaScript/TypeScript

```typescript
// API client example
const API_URL = 'http://localhost:3001/api';

const getMarkets = async () => {
  const response = await fetch(`${API_URL}/markets?page=1&limit=10`);
  const data = await response.json();
  return data;
};

const createMarket = async (marketData, token) => {
  const response = await fetch(`${API_URL}/markets`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(marketData)
  });
  return response.json();
};
```

##  SDK (Coming Soon)

Official SDKs will be available for:
- JavaScript/TypeScript
- Python
- Go
- Rust

---

<div style="background: linear-gradient(135deg, #FFD700, #9333EA); padding: 1.5rem; border-radius: 12px; color: white;">
  <strong> API Ready!</strong> Integrate OracleX into your applications with our comprehensive REST API and real-time WebSocket events.
</div>

