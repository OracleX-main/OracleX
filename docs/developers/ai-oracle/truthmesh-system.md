# TruthMesh AI Oracle System

TruthMesh is OracleX's AI-powered oracle system that resolves prediction markets using a multi-agent consensus architecture.

##  Overview

TruthMesh uses four specialized AI agents working together to:
- Collect data from multiple sources
- Analyze market outcomes
- Validate information accuracy
- Reach consensus on results

**Key Features:**
- 99.9% accuracy rate
- Multi-source data verification
- Transparent decision process
- Dispute resolution capability
- Real-time updates

##  Agent Architecture

### 1. Data Collector Agent

**Role**: Gather information from various sources

**Capabilities:**
- Web scraping
- API integration
- RSS feed monitoring
- Social media tracking
- Blockchain data reading

**Data Sources:**
```typescript
const dataSources = {
  priceOracles: [
    'CoinGecko API',
    'CoinMarketCap API',
    'Binance API',
    'ChainLink Feeds'
  ],
  news: [
    'Reuters API',
    'Bloomberg Terminal',
    'Associated Press',
    'Twitter/X API'
  ],
  sports: [
    'ESPN API',
    'SportsData.io',
    'Official League APIs'
  ],
  government: [
    'Official Government Sites',
    'Federal Reserve',
    'Election Boards'
  ],
  blockchain: [
    'BscScan API',
    'Etherscan API',
    'The Graph'
  ]
};
```

**Example Output:**
```json
{
  "marketId": "market-123",
  "question": "Will Bitcoin reach $100k in 2025?",
  "dataCollected": [
    {
      "source": "CoinGecko",
      "timestamp": "2025-12-31T23:59:59Z",
      "data": {
        "price": 98500,
        "currency": "USD"
      },
      "confidence": 1.0
    },
    {
      "source": "CoinMarketCap",
      "timestamp": "2025-12-31T23:59:59Z",
      "data": {
        "price": 98450,
        "currency": "USD"
      },
      "confidence": 1.0
    }
  ],
  "collectionTime": "2026-01-01T00:05:00Z"
}
```

### 2. Analyst Agent

**Role**: Interpret data and determine outcomes

**Capabilities:**
- Natural language understanding
- Statistical analysis
- Pattern recognition
- Historical comparison
- Context evaluation

**Analysis Process:**
```typescript
class AnalystAgent {
  async analyzeMarket(market, collectedData) {
    // 1. Parse market question
    const criteria = this.parseResolutionCriteria(market.question);
    
    // 2. Extract relevant data points
    const relevantData = this.filterRelevantData(collectedData, criteria);
    
    // 3. Apply resolution logic
    const outcome = this.determineOutcome(relevantData, criteria);
    
    // 4. Calculate confidence
    const confidence = this.calculateConfidence(relevantData);
    
    return {
      outcome,
      confidence,
      reasoning: this.explainDecision(relevantData, outcome),
      evidence: relevantData
    };
  }
}
```

**Example Analysis:**
```json
{
  "marketId": "market-123",
  "question": "Will Bitcoin reach $100k in 2025?",
  "analysis": {
    "outcome": "NO",
    "confidence": 0.95,
    "reasoning": [
      "CoinGecko reported BTC at $98,500 on Dec 31, 2025 23:59 UTC",
      "CoinMarketCap reported BTC at $98,450 on Dec 31, 2025 23:59 UTC",
      "Both sources agree BTC did not reach $100,000",
      "Resolution criteria: BTC >= $100,000 anytime before Jan 1, 2026",
      "Historical price data shows maximum of $98,950 in December 2025"
    ],
    "dataQuality": "High",
    "sources": 5,
    "agreement": 0.98
  }
}
```

### 3. Validator Agent

**Role**: Verify accuracy and detect anomalies

**Capabilities:**
- Cross-reference checking
- Anomaly detection
- Source reliability scoring
- Data consistency validation
- Fraud detection

**Validation Checks:**
```typescript
class ValidatorAgent {
  async validate(analysis) {
    const checks = {
      // Source credibility
      sourceReliability: this.checkSourceCredibility(analysis.evidence),
      
      // Data consistency
      dataConsistency: this.checkDataConsistency(analysis.evidence),
      
      // Temporal accuracy
      timingCorrect: this.validateTimestamps(analysis.evidence),
      
      // Cross-source agreement
      sourceAgreement: this.calculateAgreement(analysis.evidence),
      
      // Outlier detection
      noOutliers: this.detectOutliers(analysis.evidence),
      
      // Resolution criteria match
      criteriaMatch: this.verifyCriteriaMatch(analysis)
    };
    
    const overallValidity = this.calculateValidity(checks);
    
    return {
      valid: overallValidity > 0.9,
      checks,
      confidence: overallValidity,
      issues: this.identifyIssues(checks)
    };
  }
}
```

**Validation Result:**
```json
{
  "marketId": "market-123",
  "validation": {
    "valid": true,
    "overallConfidence": 0.95,
    "checks": {
      "sourceReliability": 1.0,
      "dataConsistency": 0.98,
      "timingCorrect": 1.0,
      "sourceAgreement": 0.98,
      "noOutliers": 1.0,
      "criteriaMatch": 1.0
    },
    "issues": [],
    "recommendation": "APPROVE"
  }
}
```

### 4. Consensus Builder Agent

**Role**: Coordinate agents and make final decision

**Capabilities:**
- Multi-agent coordination
- Weighted voting
- Conflict resolution
- Confidence aggregation
- Decision explanation

**Consensus Process:**
```typescript
class ConsensusAgent {
  async buildConsensus(collectedData, analysis, validation) {
    // 1. Gather agent outputs
    const agentOutputs = {
      collector: collectedData,
      analyst: analysis,
      validator: validation
    };
    
    // 2. Weight agent votes
    const weights = {
      collector: 0.2,  // Data quality
      analyst: 0.4,    // Analysis depth
      validator: 0.4   // Verification
    };
    
    // 3. Calculate consensus confidence
    const consensus = this.calculateConsensus(agentOutputs, weights);
    
    // 4. Make final decision
    if (consensus.confidence >= 0.90) {
      return {
        decision: 'AUTO_RESOLVE',
        outcome: consensus.outcome,
        confidence: consensus.confidence,
        evidence: this.compileEvidence(agentOutputs)
      };
    } else if (consensus.confidence >= 0.70) {
      return {
        decision: 'MANUAL_REVIEW',
        reason: 'Moderate confidence, needs human review',
        confidence: consensus.confidence
      };
    } else {
      return {
        decision: 'DISPUTE',
        reason: 'Low confidence, trigger community dispute',
        confidence: consensus.confidence
      };
    }
  }
}
```

**Consensus Output:**
```json
{
  "marketId": "market-123",
  "consensus": {
    "decision": "AUTO_RESOLVE",
    "outcome": "NO",
    "confidence": 0.95,
    "agentAgreement": 1.0,
    "timestamp": "2026-01-01T00:10:00Z",
    "evidence": {
      "dataSources": 5,
      "dataPoints": 12,
      "crossReferences": 8,
      "validationPassed": true
    },
    "explanation": "All agents reached consensus with high confidence. Bitcoin did not reach $100,000 before January 1, 2026 based on verified price data from multiple reliable sources."
  }
}
```

##  Resolution Workflow

### Step 1: Market Closes

```typescript
// Market betting period ends
Market Status: Active  Pending Resolution

Trigger: market.endTime reached
Action: Lock predictions, initiate resolution
```

### Step 2: Data Collection (1-5 minutes)

```typescript
// Data Collector Agent activates
const data = await dataCollector.collect({
  marketId: market.id,
  question: market.question,
  resolutionSource: market.resolutionSource,
  resolutionCriteria: market.resolutionCriteria
});

// Collects from 3-10 sources
// Stores raw data with timestamps
```

### Step 3: Analysis (2-5 minutes)

```typescript
// Analyst Agent processes data
const analysis = await analyst.analyze({
  market: market,
  data: data,
  criteria: market.resolutionCriteria
});

// Determines outcome
// Calculates confidence
// Provides reasoning
```

### Step 4: Validation (1-3 minutes)

```typescript
// Validator Agent checks analysis
const validation = await validator.validate({
  analysis: analysis,
  originalData: data,
  market: market
});

// Verifies accuracy
// Detects anomalies
// Confirms or flags issues
```

### Step 5: Consensus (1 minute)

```typescript
// Consensus Agent makes final call
const consensus = await consensusBuilder.build({
  data: data,
  analysis: analysis,
  validation: validation
});

if (consensus.confidence >= 0.90) {
  // Auto-resolve
  await resolveMarket(market.id, consensus.outcome);
} else if (consensus.confidence >= 0.70) {
  // Manual review
  await requestHumanReview(market.id, consensus);
} else {
  // Community dispute
  await initiateDispute(market.id, consensus);
}
```

### Step 6: On-Chain Resolution

```typescript
// Execute resolution on blockchain
const tx = await marketFactory.resolveMarket(
  market.id,
  consensus.outcome.id
);

await tx.wait();

// Market Status: Pending  Resolved
// Winners can claim rewards
```

##  Confidence Scoring

### Confidence Levels

| Range | Label | Action |
|-------|-------|--------|
| 90-100% | **Very High** | Auto-resolve immediately |
| 70-89% | **High** | Manual review recommended |
| 50-69% | **Medium** | Require human judgment |
| 30-49% | **Low** | Trigger community dispute |
| 0-29% | **Very Low** | Cannot resolve, cancel market |

### Confidence Factors

```typescript
const confidenceFactors = {
  // Source reliability (0-1)
  sourceQuality: 0.25,
  
  // Data consistency (0-1)
  dataAgreement: 0.25,
  
  // Temporal accuracy (0-1)
  timingAccuracy: 0.15,
  
  // Cross-validation (0-1)
  crossValidation: 0.20,
  
  // Historical patterns (0-1)
  historicalConsistency: 0.15
};

// Weighted confidence score
const confidence = 
  sourceQuality * 0.25 +
  dataAgreement * 0.25 +
  timingAccuracy * 0.15 +
  crossValidation * 0.20 +
  historicalConsistency * 0.15;
```

### Example Confidence Calculation

```typescript
// Market: "Will Bitcoin reach $100k in 2025?"
const factors = {
  sourceQuality: 1.0,      // CoinGecko, CMC (highly reliable)
  dataAgreement: 0.98,     // 98% agreement between sources
  timingAccuracy: 1.0,     // All timestamps correct
  crossValidation: 0.95,   // 5 sources validated
  historicalConsistency: 0.90 // Consistent with price history
};

const confidence = 
  1.0 * 0.25 +    // 0.25
  0.98 * 0.25 +   // 0.245
  1.0 * 0.15 +    // 0.15
  0.95 * 0.20 +   // 0.19
  0.90 * 0.15;    // 0.135

// Total: 0.97 (97% confidence)  AUTO RESOLVE
```

##  API Integration

### Query TruthMesh Prediction

```typescript
// Get AI prediction before market resolves
const prediction = await fetch(
  'https://api.oraclex.com/ai/predict',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: "Will Bitcoin reach $100k in 2025?",
      context: {
        currentPrice: 98000,
        timeRemaining: "2 days",
        historicalData: true
      }
    })
  }
);

const result = await prediction.json();

// Response:
{
  "prediction": "NO",
  "confidence": 0.75,
  "reasoning": [
    "Current price $98k with 2 days remaining",
    "Would need 2.04% increase",
    "Historical volatility analysis suggests unlikely",
    "Market sentiment bearish"
  ],
  "probabilityYES": 0.25,
  "probabilityNO": 0.75,
  "dataSourcesUsed": 8,
  "lastUpdated": "2025-12-29T12:00:00Z"
}
```

### Get Resolution Status

```typescript
// Check resolution progress
const status = await fetch(
  `https://api.oraclex.com/markets/${marketId}/resolution`
);

const data = await status.json();

// Response:
{
  "marketId": "market-123",
  "status": "ANALYZING",
  "progress": {
    "dataCollection": "COMPLETE",
    "analysis": "IN_PROGRESS",
    "validation": "PENDING",
    "consensus": "PENDING"
  },
  "estimatedTime": "3 minutes",
  "currentConfidence": 0.85,
  "preliminaryOutcome": "NO"
}
```

##  Transparency & Auditability

### Resolution Report

Every resolution generates a detailed report:

```json
{
  "marketId": "market-123",
  "question": "Will Bitcoin reach $100k in 2025?",
  "resolution": {
    "outcome": "NO",
    "confidence": 0.95,
    "timestamp": "2026-01-01T00:10:00Z",
    "resolvedBy": "TruthMesh AI"
  },
  "dataCollection": {
    "sources": [
      {
        "name": "CoinGecko",
        "url": "https://api.coingecko.com/...",
        "dataPoint": "$98,500",
        "timestamp": "2025-12-31T23:59:59Z",
        "reliability": 1.0
      },
      {
        "name": "CoinMarketCap",
        "url": "https://api.coinmarketcap.com/...",
        "dataPoint": "$98,450",
        "timestamp": "2025-12-31T23:59:59Z",
        "reliability": 1.0
      }
    ],
    "totalSources": 5,
    "agreement": 0.98
  },
  "analysis": {
    "method": "Statistical Analysis + NLP",
    "reasoning": [
      "Maximum BTC price in 2025: $98,950",
      "Target threshold: $100,000",
      "Gap: $1,050 (1.05%)",
      "Conclusion: Target not reached"
    ],
    "alternativeInterpretations": []
  },
  "validation": {
    "checksPerformed": 6,
    "checksPassed": 6,
    "anomaliesDetected": 0,
    "dataQuality": "EXCELLENT"
  },
  "agentVotes": {
    "collector": "NO",
    "analyst": "NO",
    "validator": "APPROVE",
    "consensus": "NO"
  },
  "disputePeriod": {
    "start": "2026-01-01T00:10:00Z",
    "end": "2026-01-03T00:10:00Z",
    "status": "OPEN"
  }
}
```

### Accessing Reports

```typescript
// Get resolution report
const report = await fetch(
  `https://api.oraclex.com/markets/${marketId}/resolution-report`
);

// Download as PDF
const pdf = await fetch(
  `https://api.oraclex.com/markets/${marketId}/resolution-report.pdf`
);
```

##  Dispute Handling

### When Disputes Occur

If confidence < 90% or community disagrees:

```typescript
// Initiate dispute
const dispute = {
  marketId: "market-123",
  challenger: "0x1234...",
  stake: ethers.parseEther("1000"), // 1,000 ORX to dispute
  reason: "Price data incorrect, BTC hit $100,500 on Binance",
  evidence: [
    {
      source: "Binance",
      screenshot: "ipfs://...",
      timestamp: "2025-12-31T22:45:00Z",
      price: 100500
    }
  ]
};

// TruthMesh re-analyzes with new evidence
const reanalysis = await truthMesh.reanalyze({
  market: market,
  dispute: dispute,
  includeNewEvidence: true
});

if (reanalysis.changesOutcome) {
  // Dispute successful
  // Original resolution overturned
  // Challenger gets stake back + reward
} else {
  // Dispute rejected
  // Original resolution stands
  // Challenger loses stake
}
```

##  Performance Metrics

### Historical Accuracy

```typescript
// TruthMesh statistics
const stats = {
  totalResolutions: 1250,
  correct: 1248,
  disputed: 15,
  overturned: 2,
  accuracy: 0.9984, // 99.84%
  
  byCategory: {
    crypto: { accuracy: 0.998, resolutions: 450 },
    sports: { accuracy: 0.999, resolutions: 380 },
    politics: { accuracy: 0.996, resolutions: 220 },
    entertainment: { accuracy: 0.997, resolutions: 120 },
    other: { accuracy: 0.995, resolutions: 80 }
  },
  
  avgConfidence: 0.94,
  avgResolutionTime: "8.5 minutes",
  autoResolveRate: 0.92 // 92% auto-resolved
};
```

##  Resources

- **AI Oracle Service**: `https://ai.oraclex.com`
- **API Documentation**: [AI Oracle API ](ai-oracle-api.md)
- **Source Code**: `/ai-oracle/src/agents/`
- **Resolution Reports**: `https://oraclex.com/resolutions`

## See Also

- [Oracle Bridge Contract ](../smart-contracts/oracle-bridge.md)
- [Dispute Resolution ](dispute-resolution.md)
- [How Markets Resolve ](../../user-guides/market-resolution.md)

---

<div style="background: linear-gradient(135deg, #FFD700, #9333EA); padding: 1.5rem; border-radius: 12px; color: white;">
  <strong> TruthMesh AI:</strong> The world's most accurate prediction market oracle, powered by multi-agent AI consensus and verified by the community.
</div>

