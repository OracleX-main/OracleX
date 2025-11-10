# Contributing to OracleX

Thank you for your interest in contributing to OracleX! This guide will help you get started.

##  Ways to Contribute

### 1. Code Contributions
- Fix bugs
- Implement new features
- Improve performance
- Enhance security

### 2. Documentation
- Improve existing docs
- Write tutorials
- Translate documentation
- Create video guides

### 3. Testing
- Write unit tests
- Perform manual testing
- Report bugs
- Suggest improvements

### 4. Community
- Answer questions on Discord
- Help new users
- Share on social media
- Organize events

### 5. Design
- UI/UX improvements
- Create graphics
- Design marketing materials
- Improve accessibility

##  Getting Started

### Fork and Clone

```bash
# 1. Fork the repository on GitHub
# Click "Fork" button on https://github.com/abdussalam-mustapha/OracleX

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/OracleX.git
cd OracleX

# 3. Add upstream remote
git remote add upstream https://github.com/abdussalam-mustapha/OracleX.git

# 4. Create a branch
git checkout -b feature/your-feature-name
```

### Setup Development Environment

```bash
# Install dependencies
npm install

# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# Contracts
cd ../contracts
npm install
```

### Run Locally

```bash
# Terminal 1: Frontend
cd frontend
npm run dev
# Runs on http://localhost:5173

# Terminal 2: Backend
cd backend
npm run dev
# Runs on http://localhost:3000

# Terminal 3: Hardhat node (for local blockchain)
cd contracts
npx hardhat node
# Runs on http://localhost:8545
```

##  Development Workflow

### 1. Create an Issue

Before starting work:

```markdown
# Issue Template

## Description
Clear description of the bug/feature

## Type
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Performance improvement

## Motivation
Why is this change needed?

## Proposed Solution
How will you implement it?

## Checklist
- [ ] Discussed with maintainers
- [ ] No duplicate issues
- [ ] Willing to implement
```

### 2. Branch Naming

```bash
# Feature branches
feature/add-nft-predictions
feature/improve-chart-performance

# Bug fix branches
fix/staking-calculation-error
fix/mobile-responsive-issue

# Documentation branches
docs/update-api-reference
docs/add-deployment-guide

# Refactor branches
refactor/optimize-queries
refactor/clean-up-components
```

### 3. Coding Standards

#### TypeScript/JavaScript

```typescript
//  Good: Use TypeScript
interface Market {
  id: string;
  question: string;
  category: string;
  endTime: number;
}

//  Use meaningful names
const calculateAverageOdds = (predictions: Prediction[]): number => {
  return predictions.reduce((sum, p) => sum + p.odds, 0) / predictions.length;
};

//  Add comments for complex logic
/**
 * Calculates compound rewards using the formula:
 * R = P * (1 + r/n)^(n*t) - P
 * where P = principal, r = APY, n = compound frequency, t = time
 */
const calculateCompoundReward = (principal, apy, days) => {
  const rate = apy / 100;
  const n = 365; // Daily compounding
  const t = days / 365;
  return principal * Math.pow(1 + rate / n, n * t) - principal;
};

//  Bad: Unclear code
const calc = (p, a, d) => p * Math.pow(1 + a / 36500, d) - p;
```

#### Solidity

```solidity
//  Good: Follow Solidity style guide
contract OracleXMarket {
    // State variables
    uint256 public constant PLATFORM_FEE = 250; // 2.5%
    
    // Events
    event MarketCreated(
        uint256 indexed marketId,
        string question,
        uint256 endTime
    );
    
    // Modifiers
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Not oracle");
        _;
    }
    
    // External functions
    function createMarket(
        string calldata question,
        string calldata category,
        uint256 bettingEndTime,
        uint256 marketEndTime,
        uint256 minimumBet,
        string[] calldata outcomes
    ) external returns (uint256 marketId) {
        // Implementation
    }
    
    // Public functions
    function getMarketDetails(uint256 marketId)
        public
        view
        returns (Market memory)
    {
        // Implementation
    }
    
    // Internal functions
    function _calculatePlatformFee(uint256 amount)
        internal
        pure
        returns (uint256)
    {
        return (amount * PLATFORM_FEE) / 10000;
    }
    
    // Private functions
    function _updateMarketState(uint256 marketId)
        private
    {
        // Implementation
    }
}

//  Use NatSpec comments
/**
 * @notice Stakes ORX tokens for a specified lock period
 * @dev Requires prior approval of ORX tokens
 * @param amount Amount of ORX tokens to stake
 * @param lockPeriod Lock period in seconds (30, 90, 180, or 365 days)
 * @return stakeId Unique identifier for the stake
 */
function stake(uint256 amount, uint256 lockPeriod)
    external
    returns (uint256 stakeId)
{
    // Implementation
}
```

#### React Components

```typescript
//  Good: Functional components with TypeScript
interface MarketCardProps {
  market: Market;
  onPredict: (marketId: string, outcome: number) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({
  market,
  onPredict,
}) => {
  const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null);
  
  const handlePredict = () => {
    if (selectedOutcome !== null) {
      onPredict(market.id, selectedOutcome);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{market.question}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  );
};

//  Use custom hooks for logic
const useMarketData = (marketId: string) => {
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetchMarket(marketId)
      .then(setMarket)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [marketId]);
  
  return { market, loading, error };
};
```

### 4. Testing Requirements

#### Unit Tests

```typescript
// contracts/test/MarketFactory.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("OracleXMarketFactory", () => {
  let marketFactory;
  let orxToken;
  let owner, oracle, user1;
  
  beforeEach(async () => {
    [owner, oracle, user1] = await ethers.getSigners();
    
    // Deploy contracts
    const ORXToken = await ethers.getContractFactory("ORXToken");
    orxToken = await ORXToken.deploy(owner.address, ethers.parseEther("1000000000"));
    
    const MarketFactory = await ethers.getContractFactory("OracleXMarketFactory");
    marketFactory = await upgrades.deployProxy(
      MarketFactory,
      [orxToken.address, oracle.address, 250],
      { initializer: "initialize" }
    );
  });
  
  describe("Market Creation", () => {
    it("should create a market with valid parameters", async () => {
      const question = "Will Bitcoin reach $100k?";
      const category = "Bitcoin";
      const bettingEndTime = Math.floor(Date.now() / 1000) + 86400;
      const marketEndTime = bettingEndTime + 86400 * 30;
      const minimumBet = ethers.parseEther("1");
      const outcomes = ["Yes", "No"];
      
      const tx = await marketFactory.createMarket(
        question,
        category,
        bettingEndTime,
        marketEndTime,
        minimumBet,
        outcomes
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "MarketCreated");
      
      expect(event).to.not.be.undefined;
      expect(event.args.question).to.equal(question);
      expect(event.args.marketId).to.equal(1);
    });
    
    it("should revert with invalid end times", async () => {
      const pastTime = Math.floor(Date.now() / 1000) - 1000;
      
      await expect(
        marketFactory.createMarket(
          "Question",
          "Category",
          pastTime, // Invalid: in the past
          pastTime + 86400,
          ethers.parseEther("1"),
          ["Yes", "No"]
        )
      ).to.be.revertedWith("Invalid betting end time");
    });
  });
  
  describe("Predictions", () => {
    let marketId;
    
    beforeEach(async () => {
      // Create a market
      const tx = await marketFactory.createMarket(
        "Test Question",
        "Test",
        Math.floor(Date.now() / 1000) + 86400,
        Math.floor(Date.now() / 1000) + 86400 * 30,
        ethers.parseEther("1"),
        ["Yes", "No"]
      );
      const receipt = await tx.wait();
      marketId = receipt.events[0].args.marketId;
      
      // Approve and transfer ORX to user1
      await orxToken.transfer(user1.address, ethers.parseEther("100"));
      await orxToken.connect(user1).approve(
        marketFactory.address,
        ethers.parseEther("100")
      );
    });
    
    it("should allow predictions on active markets", async () => {
      const amount = ethers.parseEther("10");
      const outcome = 0; // "Yes"
      
      await expect(
        marketFactory.connect(user1).predict(marketId, outcome, amount)
      ).to.emit(marketFactory, "PredictionMade")
        .withArgs(marketId, user1.address, outcome, amount);
    });
    
    it("should update odds correctly", async () => {
      const amount = ethers.parseEther("10");
      await marketFactory.connect(user1).predict(marketId, 0, amount);
      
      const market = await marketFactory.getMarketDetails(marketId);
      expect(market.totalPredictions).to.equal(amount);
      expect(market.outcomeTotals[0]).to.equal(amount);
    });
  });
});
```

#### Integration Tests

```typescript
// backend/test/integration/markets.test.ts
import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";

describe("Markets API", () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });
  
  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });
  
  describe("GET /api/markets", () => {
    it("should return paginated markets", async () => {
      const response = await request(app)
        .get("/api/markets?page=1&limit=10")
        .expect(200);
      
      expect(response.body).toHaveProperty("markets");
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.markets).toBeInstanceOf(Array);
    });
    
    it("should filter by category", async () => {
      const response = await request(app)
        .get("/api/markets?category=Bitcoin")
        .expect(200);
      
      response.body.markets.forEach(market => {
        expect(market.category).toBe("Bitcoin");
      });
    });
  });
  
  describe("POST /api/markets", () => {
    it("should create a new market", async () => {
      const marketData = {
        question: "Will Ethereum reach $10k?",
        category: "Ethereum",
        bettingEndTime: Math.floor(Date.now() / 1000) + 86400,
        marketEndTime: Math.floor(Date.now() / 1000) + 86400 * 30,
        minimumBet: "1000000000000000000",
        outcomes: ["Yes", "No"],
      };
      
      const response = await request(app)
        .post("/api/markets")
        .send(marketData)
        .expect(201);
      
      expect(response.body).toHaveProperty("marketId");
      expect(response.body.question).toBe(marketData.question);
    });
  });
});
```

### 5. Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <subject>

# Types:
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation
style:    # Code style (formatting, semicolons, etc.)
refactor: # Code refactoring
test:     # Adding/updating tests
chore:    # Maintenance tasks

# Examples:
git commit -m "feat(staking): add compound interest rewards"
git commit -m "fix(market): resolve odds calculation bug"
git commit -m "docs(api): update endpoint documentation"
git commit -m "refactor(frontend): optimize market list rendering"
git commit -m "test(contracts): add market creation tests"
git commit -m "chore(deps): update dependencies"

# Detailed message with body
git commit -m "feat(governance): implement quadratic voting

- Add quadratic voting formula
- Update voting power calculations
- Add tests for edge cases
- Update documentation

Closes #123"
```

### 6. Pull Request Process

#### Create Pull Request

```markdown
# Pull Request Template

## Description
Brief description of changes

## Related Issue
Closes #123

## Type of Change
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Added X feature
- Fixed Y bug
- Updated Z documentation

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] No console errors

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Ready for review
```

#### Review Process

1. **Automated Checks**: CI/CD runs tests
2. **Code Review**: Maintainer reviews code
3. **Feedback**: Address review comments
4. **Approval**: Get approval from maintainer
5. **Merge**: Maintainer merges PR

#### After Merge

```bash
# Sync your fork
git checkout main
git pull upstream main
git push origin main

# Delete branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

##  Development Guidelines

### Performance

```typescript
//  Good: Optimize renders
const MarketList = React.memo(({ markets }) => {
  return markets.map(market => (
    <MarketCard key={market.id} market={market} />
  ));
});

//  Use pagination
const MARKETS_PER_PAGE = 20;
const markets = await prisma.market.findMany({
  skip: (page - 1) * MARKETS_PER_PAGE,
  take: MARKETS_PER_PAGE,
});

//  Lazy load images
<img 
  src={imageUrl} 
  loading="lazy" 
  alt="Market category" 
/>

//  Bad: Load everything at once
const allMarkets = await prisma.market.findMany(); // Could be thousands!
```

### Security

```typescript
//  Good: Validate input
const createMarket = async (req, res) => {
  const { question, category, endTime } = req.body;
  
  // Validate
  if (!question || question.length < 10 || question.length > 200) {
    return res.status(400).json({ error: "Invalid question" });
  }
  
  if (endTime <= Date.now()) {
    return res.status(400).json({ error: "End time must be in future" });
  }
  
  // Sanitize
  const sanitizedQuestion = validator.escape(question);
  
  // Create market
  const market = await prisma.market.create({
    data: {
      question: sanitizedQuestion,
      category,
      endTime,
    },
  });
  
  res.json(market);
};

//  Use parameterized queries (Prisma does this automatically)
const user = await prisma.user.findUnique({
  where: { address: userAddress }, // Safe from SQL injection
});

//  Bad: Direct SQL with user input
const query = `SELECT * FROM users WHERE address = '${userAddress}'`; // SQL injection risk!
```

### Accessibility

```typescript
//  Good: Accessible components
<button
  onClick={handleClick}
  aria-label="Place prediction"
  disabled={isLoading}
>
  {isLoading ? <Spinner /> : "Predict"}
</button>

<img 
  src={icon} 
  alt="Bitcoin category icon"  // Descriptive alt text
/>

<label htmlFor="amount">
  Amount to stake:
  <input
    id="amount"
    type="number"
    value={amount}
    onChange={e => setAmount(e.target.value)}
    aria-describedby="amount-help"
  />
  <span id="amount-help">
    Minimum: 1 ORX
  </span>
</label>

//  Keyboard navigation
const handleKeyDown = (e) => {
  if (e.key === "Enter" || e.key === " ") {
    handleClick();
  }
};
```

##  Resources

- **Discord**: https://discord.gg/oraclex (ask questions)
- **GitHub Issues**: https://github.com/abdussalam-mustapha/OracleX/issues
- **Documentation**: https://docs.oraclex.com
- **Style Guide**: Airbnb JavaScript Style Guide
- **Solidity Guide**: https://docs.soliditylang.org/en/latest/style-guide.html

##  Recognition

Contributors are recognized in:
- README.md contributors section
- Monthly contributor spotlight
- Special Discord role
- NFT badges (coming soon)

---

<div style="background: linear-gradient(135deg, #FFD700, #9333EA); padding: 1.5rem; border-radius: 12px; color: white;">
  <strong> Thank You!</strong> Every contribution, no matter how small, helps make OracleX better. We appreciate your time and effort!
</div>

