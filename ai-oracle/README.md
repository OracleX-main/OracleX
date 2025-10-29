# TruthMesh AI Oracle System

Node.js + TypeScript AI Oracle system for OracleX prediction markets.

## Features

- 🤖 Multi-agent consensus engine with LangChain.js
- 🔍 Automated data fetching from multiple APIs
- ⚖️ Weighted truth verification using ML models
- 🛡️ Dispute resolution system with ensemble methods
- 📊 Confidence scoring and uncertainty quantification
- 🚀 Express.js REST API with WebSocket support
- 🔗 Direct blockchain integration with ethers.js
- 📈 Real-time market resolution and monitoring

## Architecture

```
ai-oracle/
├── src/
│   ├── agents/              # AI agent implementations
│   │   ├── BaseAgent.ts            # Base agent class
│   │   ├── DataFetcher.ts          # Retrieves data from APIs
│   │   ├── Validator.ts            # Cross-references information
│   │   ├── Arbiter.ts              # Resolves disputes
│   │   └── ConfidenceScorer.ts     # Assigns reliability scores
│   ├── sources/             # Data source integrations
│   │   ├── financial/              # Financial data sources
│   │   ├── news/                   # News aggregation
│   │   ├── social/                 # Social sentiment
│   │   └── knowledge/              # Knowledge bases
│   ├── consensus/           # Consensus mechanisms
│   │   ├── WeightedVoting.ts       # Weighted voting system
│   │   ├── Reputation.ts           # Reputation scoring
│   │   └── Ensemble.ts             # Ensemble methods
│   ├── blockchain/          # Blockchain integration
│   │   ├── Web3Client.ts           # Web3 connection
│   │   └── OracleBridge.ts         # Smart contract calls
│   ├── api/                 # Express.js endpoints
│   │   ├── routes/                 # API route handlers
│   │   └── websockets/             # Real-time updates
│   ├── models/              # AI model configurations
│   └── utils/               # Utilities and helpers
├── tests/                   # Unit and integration tests
├── config/                  # Configuration files
└── dist/                    # Compiled JavaScript output
```

## Installation

```bash
# Install dependencies
npm install

# Install development dependencies
npm install --dev

# Build TypeScript
npm run build

# Setup environment
cp .env.example .env
# Edit .env with your API keys
```

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint and format
npm run lint
npm run format
```

## API Endpoints

### Health & Monitoring
- `GET /health` - Health check and system status
- `GET /metrics` - Prometheus metrics
- `GET /agents/status` - All agents status

### Market Resolution
- `POST /api/v1/resolve/:marketId` - Trigger market resolution
- `GET /api/v1/resolve/:marketId/status` - Get resolution progress
- `POST /api/v1/resolve/:marketId/dispute` - Submit dispute
- `GET /api/v1/resolve/:marketId/confidence` - Get confidence score

### Data Sources
- `GET /api/v1/sources` - List available data sources
- `GET /api/v1/sources/:source/status` - Source health check
- `POST /api/v1/sources/:source/test` - Test data retrieval

### WebSocket Events
- `market:resolution:start` - Market resolution started
- `market:resolution:complete` - Market resolution completed
- `agent:vote:submitted` - Agent submitted vote
- `consensus:reached` - Consensus reached

## Environment Variables

```env
# API Keys
OPENAI_API_KEY=sk-...
COINGECKO_API_KEY=...
NEWS_API_KEY=...
TWITTER_BEARER_TOKEN=...
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...

# Database
DATABASE_URL=postgresql://user:pass@localhost/oraclex
REDIS_URL=redis://localhost:6379/0

# Blockchain
WEB3_PROVIDER_URL=https://data-seed-prebsc-1-s1.binance.org:8545
ORACLE_CONTRACT_ADDRESS=0x...
ORACLE_PRIVATE_KEY=...
CHAIN_ID=97

# API Configuration
PORT=8000
NODE_ENV=development
LOG_LEVEL=info

# AI Models
HUGGINGFACE_API_KEY=...
```

## Usage

### Basic Market Resolution
```typescript
import { TruthMeshOracle } from './src/oracle/TruthMeshOracle';

const oracle = new TruthMeshOracle();
await oracle.initialize();

const result = await oracle.resolveMarket({
  marketId: "123",
  question: "Will Bitcoin reach $100,000 by end of 2024?",
  deadline: "2024-12-31T23:59:59Z"
});
```

### Custom Agent Implementation
```typescript
import { BaseAgent } from './src/agents/BaseAgent';

export class CustomPriceAgent extends BaseAgent {
  async fetchData(market: Market): Promise<any> {
    // Implement your data fetching logic
    return await this.getPriceData(market.asset);
  }
  
  async validateData(data: any): Promise<number> {
    // Implement validation logic
    return this.calculateConfidence(data);
  }
}
```

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **AI/ML**: LangChain.js, OpenAI API
- **Blockchain**: ethers.js, Web3.js
- **Database**: PostgreSQL, Redis
- **Testing**: Jest, Supertest
- **Monitoring**: Prometheus, Winston

## Environment Variables

```env
OPENAI_API_KEY=sk-...
COINGECKO_API_KEY=...
NEWS_API_KEY=...
TWITTER_BEARER_TOKEN=...
BLOCKCHAIN_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
ORACLE_PRIVATE_KEY=...
CONTRACT_ADDRESS=...
```

## Usage

```bash
# Start the AI oracle service
python main.py

# Start in development mode
python main.py --dev

# Process specific market
python main.py --market-id 123
```