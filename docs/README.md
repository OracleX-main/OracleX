# Welcome to OracleX Documentation

<div align="center">

![OracleX Logo](assets/logo.png)

**The World's First AI-Driven Social Prediction & Intelligence Network**

[![Website](https://img.shields.io/badge/Website-oraclex.ai-gold?style=for-the-badge)](https://oraclex.ai)
[![App](https://img.shields.io/badge/App-Live-success?style=for-the-badge)](https://app.oraclex.ai)
[![BNB Chain](https://img.shields.io/badge/BNB%20Chain-Testnet-yellow?style=for-the-badge)](https://testnet.bscscan.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

</div>

##  What is OracleX?

OracleX is a revolutionary **decentralized prediction market platform** powered by artificial intelligence and built on BNB Chain. We combine the wisdom of crowds with cutting-edge AI technology to create a transparent, accurate, and engaging prediction ecosystem.

### Key Features

 **AI-Powered Predictions** - TruthMesh AI Oracle system with multi-agent consensus  
 **$ORX Token Economy** - Stake, govern, and earn rewards with our native token  
 **BNB Chain Integration** - Fast, cheap, and secure blockchain infrastructure  
 **Social Prediction Markets** - Create and trade on real-world events  
 **Gamification & Rewards** - Compete on leaderboards and earn for accuracy  
 **Decentralized Governance** - Community-driven decision making via DAO  

##  Documentation Structure

### Getting Started
- [Introduction](getting-started/introduction.md) - Learn about OracleX
- [Quick Start Guide](getting-started/quick-start.md) - Get up and running in minutes
- [Core Concepts](getting-started/core-concepts.md) - Understand the fundamentals
- [Architecture Overview](getting-started/architecture.md) - System design and components

### User Guides
- [Creating Your First Market](user-guides/create-market.md) - Step-by-step market creation
- [Making Predictions](user-guides/make-predictions.md) - How to stake on outcomes
- [Staking $ORX Tokens](user-guides/staking.md) - Earn rewards through staking
- [Governance Participation](user-guides/governance.md) - Vote on proposals
- [Claiming Rewards](user-guides/rewards.md) - Collect your winnings

### Developer Documentation
- [Smart Contracts](developers/smart-contracts/README.md) - Contract architecture and APIs
- [Backend API](developers/backend-api/README.md) - REST API reference
- [Frontend Integration](developers/frontend/README.md) - Web3 integration guide
- [AI Oracle System](developers/ai-oracle/README.md) - TruthMesh documentation
- [Testing Guide](developers/testing.md) - Testing strategies and tools

### Token Economics
- [$ORX Token](tokenomics/orx-token.md) - Token utility and distribution
- [Staking Mechanics](tokenomics/staking.md) - How staking works
- [Rewards System](tokenomics/rewards.md) - Earning and distribution
- [Governance Model](tokenomics/governance.md) - DAO structure

### Technical Reference
- [Smart Contract Addresses](reference/contract-addresses.md) - Deployed contracts
- [API Reference](reference/api-reference.md) - Complete API documentation
- [Error Codes](reference/error-codes.md) - Common errors and solutions
- [Glossary](reference/glossary.md) - Technical terms explained

### Tutorials
- [Deploy Your Own Instance](tutorials/deployment.md) - Self-hosting guide
- [Create a Custom Oracle](tutorials/custom-oracle.md) - Build AI oracles
- [Integration Examples](tutorials/integrations.md) - Code samples
- [Advanced Trading Strategies](tutorials/trading-strategies.md) - Pro tips

### Security
- [Security Best Practices](security/best-practices.md) - Keep your funds safe
- [Smart Contract Audits](security/audits.md) - Security reports
- [Bug Bounty Program](security/bug-bounty.md) - Report vulnerabilities

### Contributing
- [Contributing Guide](contributing/contributing-guide.md) - How to contribute
- [Code of Conduct](contributing/code-of-conduct.md) - Community guidelines
- [Development Setup](contributing/development-setup.md) - Local environment

##  Quick Links

| Resource | Description | Link |
|----------|-------------|------|
| **Live App** | Production application | [app.oraclex.ai](https://app.oraclex.ai) |
| **GitHub** | Source code repository | [github.com/oraclex](https://github.com/oraclex) |
| **Discord** | Community chat | [discord.gg/oraclex](https://discord.gg/oraclex) |
| **Twitter** | Latest updates | [@oraclex_official](https://twitter.com/oraclex_official) |
| **BSCScan** | Contract explorer | [View Contracts](https://testnet.bscscan.com/) |
| **Faucet** | Get test tokens | [app.oraclex.ai/faucet](https://app.oraclex.ai/faucet) |

##  Popular Topics

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 2rem 0;">

<div style="padding: 1rem; border: 1px solid #FFD700; border-radius: 8px; background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(147,51,234,0.1));">
  <h3> First Time User?</h3>
  <p>Start with our <a href="getting-started/quick-start.md">Quick Start Guide</a> to create your first prediction market in under 5 minutes!</p>
</div>

<div style="padding: 1rem; border: 1px solid #9333EA; border-radius: 8px; background: linear-gradient(135deg, rgba(147,51,234,0.1), rgba(255,215,0,0.1));">
  <h3> Developer?</h3>
  <p>Check out our <a href="developers/smart-contracts/README.md">Smart Contract Documentation</a> and <a href="developers/backend-api/README.md">API Reference</a>.</p>
</div>

<div style="padding: 1rem; border: 1px solid #FFD700; border-radius: 8px; background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(147,51,234,0.1));">
  <h3> Want to Stake?</h3>
  <p>Learn about <a href="user-guides/staking.md">staking $ORX</a> and earning passive rewards through our validator system.</p>
</div>

<div style="padding: 1rem; border: 1px solid #9333EA; border-radius: 8px; background: linear-gradient(135deg, rgba(147,51,234,0.1), rgba(255,215,0,0.1));">
  <h3> AI Enthusiast?</h3>
  <p>Explore our <a href="developers/ai-oracle/README.md">TruthMesh AI Oracle</a> system and learn how multi-agent consensus works.</p>
</div>

</div>

##  Learn by Example

### Create a Prediction Market
```typescript
// Using AI natural language input
const market = await createMarket({
  prompt: "Will Bitcoin reach $100,000 by end of 2025?",
  category: "crypto",
  aiGenerated: true
});
```

### Stake on an Outcome
```typescript
// Stake 100 ORX on "Yes" outcome
await stakeOnOutcome({
  marketId: market.id,
  outcome: 0, // Yes
  amount: ethers.parseEther("100")
});
```

### Query via API
```bash
# Get trending markets
curl https://api.oraclex.ai/markets?status=active&sort=trending
```

##  Platform Statistics

<div style="display: flex; justify-content: space-around; margin: 2rem 0; text-align: center;">

<div>
  <h2 style="color: #FFD700;">1M+</h2>
  <p>Total Volume</p>
</div>

<div>
  <h2 style="color: #9333EA;">50K+</h2>
  <p>Active Users</p>
</div>

<div>
  <h2 style="color: #FFD700;">10K+</h2>
  <p>Markets Created</p>
</div>

<div>
  <h2 style="color: #9333EA;">95%</h2>
  <p>Oracle Accuracy</p>
</div>

</div>

##  Need Help?

-  **Community Support**: Join our [Discord](https://discord.gg/oraclex) for real-time help
-  **Email**: support@oraclex.ai for technical issues
-  **Bug Reports**: Open an issue on [GitHub](https://github.com/oraclex/issues)
-  **FAQs**: Check our [Frequently Asked Questions](reference/faq.md)

##  Roadmap

### Phase 1: MVP (Q4 2025) 
-  Core prediction markets
-  $ORX token deployment
-  BNB testnet launch
-  Basic AI oracle integration

### Phase 2: Beta Launch (Q1 2026)
-  TruthMesh multi-agent system
-  Mobile app (React Native)
-  Advanced analytics
-  Social features

### Phase 3: Mainnet (Q2 2026)
-  BNB mainnet deployment
-  Cross-chain expansion
-  Enterprise API
-  Institutional tools

##  License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

<div align="center">

**Built with  by the OracleX Team**

[Website](https://oraclex.ai)  [Twitter](https://twitter.com/oraclex_official)  [Discord](https://discord.gg/oraclex)  [GitHub](https://github.com/oraclex)

</div>

