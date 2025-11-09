# Architecture Overview

This document provides a comprehensive overview of OracleX's technical architecture, covering all system components, their interactions, and design decisions.

## 🏗️ System Architecture

### High-Level Overview

```
┌────────────────────────────────────────────────────────────────┐
│                          Users                                  │
│              (Web Browsers, Mobile Wallets)                     │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 │ HTTPS/WSS
                 │
┌────────────────▼───────────────────────────────────────────────┐
│                     Frontend Layer                              │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ React 18 + TypeScript + Vite                             │ │
│  │ • Pages (Markets, Staking, Governance, Profile)          │ │
│  │ • Components (Shadcn UI, Custom)                         │ │
│  │ • State Management (React Context, Hooks)                │ │
│  │ • Web3 Integration (ethers.js v6, MetaMask)              │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────┬───────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        │ REST/WSS        │ Web3 RPC
        │                 │
┌───────▼────────┐  ┌────▼──────────────────────────────────────┐
│  Backend API   │  │    BNB Chain (Smart Contracts)            │
│  (Node.js)     │  │  ┌────────────────────────────────────┐  │
│                │  │  │ ORX Token (ERC-20)                  │  │
│ ┌────────────┐ │  │  │ • Transfer, Approve, Allowance     │  │
│ │PostgreSQL  │ │  │  └────────────────────────────────────┘  │
│ │ Database   │ │  │  ┌────────────────────────────────────┐  │
│ └────────────┘ │  │  │ Market Factory                      │  │
│                │  │  │ • Create, List, Pause Markets       │  │
│ ┌────────────┐ │  │  └────────────────────────────────────┘  │
│ │   Redis    │ │  │  ┌────────────────────────────────────┐  │
│ │   Cache    │ │  │  │ Prediction Market                   │  │
│ └────────────┘ │  │  │ • Stake, Claim, Resolve             │  │
│                │  │  └────────────────────────────────────┘  │
│ ┌────────────┐ │  │  ┌────────────────────────────────────┐  │
│ │ Blockchain │ │  │  │ Staking Contract                    │  │
│ │  Sync      │◄─┼──┼──│ • Stake, Unstake, Rewards          │  │
│ └────────────┘ │  │  └────────────────────────────────────┘  │
└───────┬────────┘  │  ┌────────────────────────────────────┐  │
        │           │  │ Governance DAO                      │  │
        │           │  │ • Proposals, Voting, Execution      │  │
        │           │  └────────────────────────────────────┘  │
        │           │  ┌────────────────────────────────────┐  │
        │           │  │ Dispute Resolution                  │  │
        │           │  │ • Challenge, Vote, Resolve          │  │
        │           │  └────────────────────────────────────┘  │
        │           │  ┌────────────────────────────────────┐  │
        │           │  │ Oracle Bridge                       │  │
        │           │  │ • Register Oracles, Submit Data     │  │
        │           │  └────────────┬───────────────────────┘  │
        │           └───────────────┼──────────────────────────┘
        │                           │
        │                           │ Oracle Callbacks
        │                           │
┌───────▼──────────────────────────▼──────────────────────────────┐
│              TruthMesh AI Oracle (Python)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FastAPI Server                                           │   │
│  │  • REST API endpoints                                    │   │
│  │  • Webhook handlers                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Agent System (LangChain + OpenAI)                       │   │
│  │  • Data Fetcher Agent                                    │   │
│  │  • Validator Agent                                       │   │
│  │  • Arbiter Agent                                         │   │
│  │  • Confidence Scorer                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Data Sources                                             │   │
│  │  • CoinGecko API (crypto prices)                        │   │
│  │  • NewsAPI (news & events)                              │   │
│  │  • Twitter API (social sentiment)                       │   │
│  │  • Weather APIs (climate data)                          │   │
│  │  • Custom scrapers                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## 📦 Component Breakdown

### 1. Frontend Layer

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast HMR, optimized builds)
- **Styling**: TailwindCSS + Shadcn UI components
- **Web3**: ethers.js v6 for blockchain interaction
- **State**: React Context API + custom hooks
- **Routing**: React Router v6

**Key Directories:**
```
frontend/src/
├── pages/           # Route pages (Markets, Staking, etc.)
├── components/      # Reusable UI components
│   ├── ui/          # Shadcn UI primitives
│   └── [custom]/    # App-specific components
├── services/        # API and Web3 services
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
├── abis/            # Smart contract ABIs
└── assets/          # Images, fonts, icons
```

**Web3 Integration:**
```typescript
// Wallet Connection
const { provider, signer, address } = useWallet();

// Contract Interaction
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  signer
);

// Transaction with error handling
try {
  const tx = await contract.stakeTokens(amount, lockPeriod, false);
  const receipt = await tx.wait();
  console.log('Transaction hash:', tx.hash);
} catch (error) {
  handleError(error);
}
```

### 2. Backend API Layer

**Technology Stack:**
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma (PostgreSQL)
- **Cache**: Redis
- **Logging**: Winston
- **Validation**: Zod

**Architecture Pattern:**
```
Routes → Controllers → Services → Models
  ↓
Middleware (Auth, Validation, Error Handling)
```

**Key Directories:**
```
backend/src/
├── routes/          # API route definitions
├── controllers/     # Request handlers
├── services/        # Business logic
│   ├── blockchain/  # Blockchain interaction
│   ├── oracle/      # Oracle communication
│   └── analytics/   # Data aggregation
├── models/          # Prisma schema & types
├── middleware/      # Express middleware
├── utils/           # Helper functions
└── config/          # Configuration files
```

**Database Schema:**
```prisma
model Market {
  id              String      @id @default(uuid())
  marketId        String      @unique // On-chain ID
  title           String
  description     String
  category        String
  status          MarketStatus
  expiryTime      DateTime
  totalVolume     Decimal
  outcomes        Outcome[]
  predictions     Prediction[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model User {
  id              String      @id @default(uuid())
  address         String      @unique
  reputation      Int         @default(500)
  totalEarnings   Decimal     @default(0)
  predictions     Prediction[]
  createdAt       DateTime    @default(now())
}

model Prediction {
  id              String      @id @default(uuid())
  user            User        @relation(fields: [userId], references: [id])
  userId          String
  market          Market      @relation(fields: [marketId], references: [id])
  marketId        String
  outcome         Int
  amount          Decimal
  timestamp       DateTime    @default(now())
  claimed         Boolean     @default(false)
}
```

### 3. Smart Contract Layer

**Blockchain**: BNB Chain (Binance Smart Chain)
- **Network**: Testnet (Chain ID: 97)
- **RPC**: https://bsc-testnet-rpc.publicnode.com
- **Explorer**: https://testnet.bscscan.com

**Contract Architecture:**

#### ORX Token (ERC-20)
```solidity
contract ORXToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    
    mapping(address => bool) public minters;
    
    function mint(address to, uint256 amount) external onlyMinter {
        require(totalSupply() + amount <= TOTAL_SUPPLY);
        _mint(to, amount);
    }
    
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
    }
}
```

**Deployed**: `0x7eE4f73bab260C11c68e5560c46E3975E824ed79`

#### Market Factory
```solidity
contract PredictionMarketFactory {
    mapping(uint256 => Market) public markets;
    uint256 public marketCounter;
    uint256 public marketCreationFee = 0.01 ether;
    
    function createMarket(
        string memory title,
        string[] memory outcomes,
        uint256 expiryTime,
        address oracle
    ) external payable returns (uint256) {
        require(msg.value >= marketCreationFee);
        // Create market logic
    }
}
```

**Deployed**: `0x273C8Dde70897069BeC84394e235feF17e7c5E1b`

#### Staking Contract
```solidity
contract StakingContract {
    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
        uint256 lockPeriod;
        uint256 rewardDebt;
        bool isValidator;
    }
    
    mapping(address => StakeInfo) public stakes;
    
    uint256 public rewardRate = 100000000000000; // per second
    uint256 public minimumStakingPeriod = 7 days;
    
    function stakeTokens(
        uint256 amount,
        uint256 lockPeriod,
        bool asValidator
    ) external {
        require(lockPeriod >= minimumStakingPeriod);
        // Staking logic
    }
}
```

**Deployed**: `0x007Aaa957829ea04e130809e9cebbBd4d06dABa2`

### 4. AI Oracle Layer

**Technology Stack:**
- **Framework**: FastAPI (Python 3.11+)
- **AI/ML**: LangChain + OpenAI GPT-4
- **Data**: Pandas, NumPy
- **HTTP Client**: httpx (async)
- **Task Queue**: Celery + Redis

**Agent Architecture:**

```python
class TruthMeshOracle:
    def __init__(self):
        self.data_fetcher = DataFetcherAgent()
        self.validator = ValidatorAgent()
        self.arbiter = ArbiterAgent()
        self.scorer = ConfidenceScorerAgent()
    
    async def resolve_market(self, market_id: str) -> Resolution:
        # 1. Fetch data from multiple sources
        raw_data = await self.data_fetcher.fetch(market_id)
        
        # 2. Validate data integrity
        validated_data = await self.validator.validate(raw_data)
        
        # 3. Determine outcome
        outcome = await self.arbiter.decide(validated_data)
        
        # 4. Calculate confidence score
        confidence = await self.scorer.score(outcome, validated_data)
        
        return Resolution(
            market_id=market_id,
            outcome=outcome,
            confidence=confidence,
            sources=validated_data.sources
        )
```

**Data Sources Integration:**

```python
# CoinGecko for crypto prices
async def fetch_crypto_price(symbol: str, date: datetime):
    url = f"https://api.coingecko.com/api/v3/coins/{symbol}/history"
    params = {"date": date.strftime("%d-%m-%Y")}
    response = await client.get(url, params=params)
    return response.json()["market_data"]["current_price"]["usd"]

# NewsAPI for events
async def fetch_news_sentiment(query: str, date_range: tuple):
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": query,
        "from": date_range[0],
        "to": date_range[1],
        "sortBy": "relevancy",
        "apiKey": settings.NEWS_API_KEY
    }
    response = await client.get(url, params=params)
    articles = response.json()["articles"]
    return analyze_sentiment(articles)
```

## 🔄 Data Flow

### 1. Market Creation Flow

```
User (Frontend)
    ↓ AI generates market details
Frontend validates input
    ↓ POST /api/markets
Backend API
    ↓ Store in database
    ↓ Check wallet approval
Web3 Transaction
    ↓ createMarket(title, outcomes, expiry)
Smart Contract
    ↓ Emit MarketCreated event
Blockchain Sync Service
    ↓ Listen for events
    ↓ Update database status
Backend Database
    ↓ Notify frontend via WebSocket
Frontend updates UI
```

### 2. Prediction Flow

```
User selects outcome + amount
    ↓
Frontend calculates expected returns
    ↓
Check/Request ORX approval
    ↓ approve(stakingContract, amount)
ORX Token Contract
    ↓ Approval granted
    ↓ stakeTokens(marketId, outcome, amount)
Market Contract
    ↓ Transfer ORX from user
    ↓ Update stake info
    ↓ Emit Prediction event
Blockchain Sync
    ↓ Update prediction in DB
Backend Database
    ↓ Update user portfolio
Frontend refreshes UI
```

### 3. Market Resolution Flow

```
Market expires (expiryTime reached)
    ↓
Cron job detects expired market
    ↓ POST /oracle/resolve/{marketId}
Backend triggers Oracle
    ↓
TruthMesh AI Oracle
    ├─ Fetch data from sources
    ├─ Cross-validate
    ├─ Determine outcome
    └─ Calculate confidence
    ↓ Return resolution
Backend receives result
    ↓ resolveMarket(marketId, winningOutcome)
Smart Contract
    ↓ Set winner
    ↓ Enable claims
    ↓ Emit MarketResolved event
Blockchain Sync
    ↓ Update market status
Backend notifies winners
    ↓ Push notifications
Users claim rewards
```

## 🔐 Security Architecture

### Smart Contract Security

**1. Access Control**
```solidity
// Ownable pattern for admin functions
modifier onlyOwner() {
    require(msg.sender == owner);
    _;
}

// Role-based access for oracles
modifier onlyOracle() {
    require(oracles[msg.sender].isActive);
    _;
}
```

**2. Reentrancy Protection**
```solidity
// OpenZeppelin ReentrancyGuard
modifier nonReentrant() {
    require(_status != _ENTERED);
    _status = _ENTERED;
    _;
    _status = _NOT_ENTERED;
}
```

**3. SafeMath & Checks**
```solidity
// Safe token transfers
using SafeERC20 for IERC20;
orxToken.safeTransferFrom(msg.sender, address(this), amount);

// Overflow protection (Solidity 0.8+)
uint256 total = stake.amount + newAmount; // Auto-reverts on overflow
```

### API Security

**1. Rate Limiting**
```typescript
// Express rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests"
});

app.use('/api/', limiter);
```

**2. Input Validation**
```typescript
// Zod schema validation
const createMarketSchema = z.object({
  title: z.string().min(10).max(200),
  outcomes: z.array(z.string()).min(2).max(10),
  expiryTime: z.number().min(Date.now() + 3600000), // At least 1 hour future
  category: z.enum(['crypto', 'sports', 'politics', 'business', 'science'])
});
```

**3. Authentication**
```typescript
// Wallet signature verification
async function verifySignature(address: string, signature: string, message: string) {
  const recoveredAddress = ethers.verifyMessage(message, signature);
  return recoveredAddress.toLowerCase() === address.toLowerCase();
}
```

## 📊 Performance Optimization

### Frontend Optimization

**1. Code Splitting**
```typescript
// Lazy load routes
const Markets = lazy(() => import('./pages/Markets'));
const Staking = lazy(() => import('./pages/Staking'));

// Route with Suspense
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/markets" element={<Markets />} />
  </Routes>
</Suspense>
```

**2. Memoization**
```typescript
// Memoize expensive calculations
const sortedMarkets = useMemo(() => {
  return markets.sort((a, b) => b.volume - a.volume);
}, [markets]);

// Prevent unnecessary re-renders
const MarketCard = memo(({ market }) => {
  return <div>{market.title}</div>;
});
```

### Backend Optimization

**1. Database Indexing**
```prisma
model Market {
  marketId    String  @unique
  status      String  @index
  category    String  @index
  expiryTime  DateTime @index
  
  @@index([status, category])
  @@index([createdAt(sort: Desc)])
}
```

**2. Caching Strategy**
```typescript
// Redis cache with TTL
async function getCachedMarkets(category: string) {
  const cacheKey = `markets:${category}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Fetch from database
  const markets = await prisma.market.findMany({
    where: { category }
  });
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(markets));
  
  return markets;
}
```

**3. Connection Pooling**
```typescript
// Prisma connection pool
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Connection pool settings
  connection_limit = 10
  pool_timeout = 20
}
```

### Blockchain Optimization

**1. Batch Queries**
```typescript
// Query multiple contracts in one call
const multicall = new ethers.Contract(
  MULTICALL_ADDRESS,
  MULTICALL_ABI,
  provider
);

const calls = markets.map(market => ({
  target: market.address,
  callData: market.interface.encodeFunctionData('getTotalVolume')
}));

const results = await multicall.aggregate(calls);
```

**2. Event Indexing**
```typescript
// Index events incrementally
const lastBlock = await getLastIndexedBlock();
const currentBlock = await provider.getBlockNumber();

// Query in chunks of 1000 blocks
for (let from = lastBlock; from < currentBlock; from += 1000) {
  const to = Math.min(from + 1000, currentBlock);
  const events = await contract.queryFilter(
    contract.filters.MarketCreated(),
    from,
    to
  );
  await processEvents(events);
}
```

## 🚀 Deployment Architecture

### Production Infrastructure

```
┌─────────────────────────────────────────────────────────┐
│                  Cloudflare CDN                          │
│                  (SSL, DDoS Protection)                  │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴───────────┐
        │                        │
┌───────▼────────┐      ┌────────▼────────┐
│  Vercel         │      │  Railway        │
│  (Frontend)     │      │  (Backend API)  │
│  • React build  │      │  • Node.js      │
│  • Edge cache   │      │  • PostgreSQL   │
│  • Auto-scale   │      │  • Redis        │
└─────────────────┘      └─────────────────┘
                               │
                         ┌─────▼─────┐
                         │  Docker    │
                         │  (Oracle)  │
                         └───────────┘
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm test
      
  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/deploy@v1
        with:
          token: ${{ secrets.VERCEL_TOKEN }}
  
  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railway/deploy@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
```

## 📚 Further Reading

- [Smart Contract Details →](../developers/smart-contracts/README.md)
- [Backend API Documentation →](../developers/backend-api/README.md)
- [AI Oracle System →](../developers/ai-oracle/README.md)
- [Security Best Practices →](../security/best-practices.md)

---

<div style="background: linear-gradient(135deg, #FFD700, #9333EA); padding: 1.5rem; border-radius: 12px; color: white;">
  <strong>🏗️ Architecture Note:</strong> This is a living document. As OracleX evolves, this architecture documentation will be updated to reflect the latest system design and best practices.
</div>
