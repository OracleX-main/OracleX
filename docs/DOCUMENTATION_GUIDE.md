# Documentation Generation Guide

This guide explains the OracleX documentation structure and how to generate/update documentation pages.

## 📚 Documentation Structure

The documentation is organized into the following sections:

###  Getting Started (✅ Complete)
- ✅ `getting-started/introduction.md` - Overview of OracleX
- ✅ `getting-started/quick-start.md` - 5-minute getting started guide
- ✅ `getting-started/core-concepts.md` - Fundamental concepts
- ✅ `getting-started/architecture.md` - System architecture overview

### 📖 User Guides (To Create)
- `user-guides/wallet-setup.md` - Setting up MetaMask
- `user-guides/getting-orx.md` - How to get ORX tokens
- `user-guides/create-market.md` - Creating prediction markets
- `user-guides/make-predictions.md` - How to stake on outcomes
- `user-guides/staking.md` - Staking for rewards
- `user-guides/governance.md` - Participating in DAO governance
- `user-guides/rewards.md` - Claiming rewards
- `user-guides/profile.md` - Managing your profile

### 👨‍💻 Smart Contract Documentation (To Create)
- `developers/smart-contracts/README.md` - Overview
- `developers/smart-contracts/orx-token.md` - ORX Token contract
- `developers/smart-contracts/market-factory.md` - Market Factory
- `developers/smart-contracts/prediction-markets.md` - Individual markets
- `developers/smart-contracts/staking-contract.md` - Staking mechanics
- `developers/smart-contracts/governance-dao.md` - Governance system
- `developers/smart-contracts/dispute-resolution.md` - Dispute handling
- `developers/smart-contracts/oracle-bridge.md` - Oracle integration
- `developers/smart-contracts/ai-oracle.md` - AI Oracle contract

### 🔌 Backend API (To Create)
- `developers/backend-api/README.md` - API overview
- `developers/backend-api/authentication.md` - Auth methods
- `developers/backend-api/markets.md` - Markets endpoints
- `developers/backend-api/users.md` - User endpoints
- `developers/backend-api/predictions.md` - Predictions API
- `developers/backend-api/analytics.md` - Analytics endpoints
- `developers/backend-api/staking.md` - Staking API
- `developers/backend-api/faucet.md` - Faucet endpoints
- `developers/backend-api/websockets.md` - Real-time events

### 🤖 AI Oracle System (To Create)
- `developers/ai-oracle/README.md` - TruthMesh overview
- `developers/ai-oracle/agent-architecture.md` - Agent system
- `developers/ai-oracle/data-sources.md` - Data integration
- `developers/ai-oracle/consensus.md` - Consensus mechanism
- `developers/ai-oracle/confidence-scoring.md` - Scoring system
- `developers/ai-oracle/dispute-resolution.md` - Dispute handling
- `developers/ai-oracle/custom-oracles.md` - Building custom oracles

### 💎 Token Economics (To Create)
- `tokenomics/orx-token.md` - ORX token details
- `tokenomics/distribution.md` - Token distribution
- `tokenomics/staking.md` - Staking mechanics
- `tokenomics/rewards.md` - Reward system
- `tokenomics/governance.md` - Governance model
- `tokenomics/fees.md` - Fee structure
- `tokenomics/metrics.md` - Economic metrics

### 📘 Reference (To Create)
- `reference/contract-addresses.md` - Deployed contracts
- `reference/network-config.md` - Network configuration
- `reference/api-reference.md` - Complete API reference
- `reference/error-codes.md` - Error codes & solutions
- `reference/events.md` - Contract events
- `reference/glossary.md` - Terms and definitions
- `reference/faq.md` - Frequently asked questions

### 🎓 Tutorials (To Create)
- `tutorials/deployment.md` - Deploy local instance
- `tutorials/first-market.md` - Create first market tutorial
- `tutorials/custom-oracle.md` - Build custom oracle
- `tutorials/integrations.md` - Integration examples
- `tutorials/trading-strategies.md` - Trading strategies
- `tutorials/bot-development.md` - Bot development guide

### 🔐 Security (To Create)
- `security/overview.md` - Security overview
- `security/best-practices.md` - Best practices
- `security/audits.md` - Audit reports
- `security/bug-bounty.md` - Bug bounty program
- `security/incident-response.md` - Incident handling

### 🤝 Contributing (To Create)
- `contributing/contributing-guide.md` - How to contribute
- `contributing/code-of-conduct.md` - Community guidelines
- `contributing/development-setup.md` - Local development
- `contributing/coding-standards.md` - Code standards
- `contributing/pull-requests.md` - PR process
- `contributing/testing.md` - Testing guidelines

### 📦 Resources (To Create)
- `resources/changelog.md` - Version history
- `resources/roadmap.md` - Product roadmap
- `resources/brand-assets.md` - Branding assets
- `resources/community.md` - Community resources
- `resources/legal.md` - Legal documents

## 🎨 Documentation Style Guide

### Colors & Branding

Use OracleX brand colors in documentation:

- **Primary Gold**: `#FFD700` - Main brand color
- **Purple**: `#9333EA` - Secondary brand color
- **Blue**: `#3B82F6` - Accent color
- **Dark**: `#0F172A` - Dark backgrounds
- **Text**: `#E2E8F0` - Light text

### Gradients

```css
/* Primary Gradient */
background: linear-gradient(135deg, #FFD700, #9333EA);

/* Card Gradient */
background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(147,51,234,0.1));
```

### Icons & Emojis

Use consistent emojis for sections:

- 🎯 Prediction markets
- 💎 $ORX Token
- 🤖 AI/Oracle system
- 🏛️ Governance
- 📊 Analytics
- 🔐 Security
- ⚡ Performance
- 🚀 Deployment
- 📚 Documentation
- 💡 Tips/Pro-tips
- ⚠️ Warnings
- ✅ Success/Completed
- ❌ Error/Failed
- 🔄 In Progress

### Code Blocks

Use proper syntax highlighting:

```typescript
// TypeScript/JavaScript
const contract = new ethers.Contract(address, abi, signer);
```

```solidity
// Solidity smart contracts
function stakeTokens(uint256 amount) external {
    // Implementation
}
```

```python
# Python (AI Oracle)
async def resolve_market(market_id: str):
    # Implementation
```

```bash
# Shell commands
npm install
npm run dev
```

### Call-out Boxes

```html
<!-- Info Box -->
<div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 1rem; border-radius: 8px; color: white; margin: 1rem 0;">
  <strong>ℹ️ Info:</strong> Important information here
</div>

<!-- Warning Box -->
<div style="background: linear-gradient(135deg, #F59E0B, #D97706); padding: 1rem; border-radius: 8px; color: white; margin: 1rem 0;">
  <strong>⚠️ Warning:</strong> Caution message here
</div>

<!-- Success Box -->
<div style="background: linear-gradient(135deg, #10B981, #059669); padding: 1rem; border-radius: 8px; color: white; margin: 1rem 0;">
  <strong>✅ Success:</strong> Success message here
</div>

<!-- Pro Tip Box -->
<div style="background: linear-gradient(135deg, #FFD700, #9333EA); padding: 1rem; border-radius: 8px; color: white; margin: 1rem 0;">
  <strong>💡 Pro Tip:</strong> Expert advice here
</div>
```

## 📝 Page Template

Use this template for new pages:

```markdown
# Page Title

Brief introduction paragraph explaining what this page covers.

## Section 1

Content for section 1...

### Subsection 1.1

Detailed content...

## Code Examples

\`\`\`typescript
// Code example with syntax highlighting
const example = "value";
\`\`\`

## Diagrams

Use mermaid for diagrams:

\`\`\`mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`

## See Also

- [Related Page 1](link)
- [Related Page 2](link)

---

<div style="background: linear-gradient(135deg, #FFD700, #9333EA); padding: 1.5rem; border-radius: 12px; color: white;">
  <strong>💡 Next Steps:</strong> Links to next recommended pages
</div>
```

## 🔨 Building the Documentation

### Local Development

```bash
# Install GitBook CLI
npm install -g gitbook-cli

# Initialize GitBook
cd docs
gitbook init

# Serve locally
gitbook serve

# Visit http://localhost:4000
```

### Building for Production

```bash
# Build static site
gitbook build

# Output to _book/ directory
ls _book/
```

### Deploy to GitBook.com

1. Sign up at [gitbook.com](https://gitbook.com)
2. Connect GitHub repository
3. Configure build settings:
   - Root path: `/docs`
   - Config file: `.gitbook.yaml`
4. Auto-deploy on push to `main` branch

### Deploy to Custom Domain

```yaml
# .gitbook.yaml
url: https://docs.oraclex.ai

# Configure DNS:
# CNAME docs.oraclex.ai -> your-space.gitbook.io
```

## 📦 Assets

### Images

Store images in `docs/assets/`:

```
docs/assets/
├── logo.png           # OracleX logo
├── banner.png         # Hero banner
├── favicon.ico        # Favicon
├── screenshots/       # App screenshots
├── diagrams/          # Architecture diagrams
└── icons/             # UI icons
```

### Using Images

```markdown
![Logo](../assets/logo.png)
![Banner](assets/banner.png)
```

## ✅ Documentation Checklist

### For Each Page

- [ ] Clear title and introduction
- [ ] Consistent formatting
- [ ] Code examples with proper syntax highlighting
- [ ] Screenshots/diagrams where helpful
- [ ] Internal links to related pages
- [ ] External links to relevant resources
- [ ] Call-out boxes for important info
- [ ] "See Also" section at bottom
- [ ] Brand colors and styling
- [ ] Proofread for typos

### For New Sections

- [ ] Update `SUMMARY.md` table of contents
- [ ] Add to `.gitbook.yaml` if needed
- [ ] Create index/README.md for section
- [ ] Link from parent pages
- [ ] Add to search keywords

## 🚀 Next Steps

1. **Review existing pages** - Introduction, Quick Start, Core Concepts, Architecture
2. **Create remaining pages** - Use the page list above
3. **Add screenshots** - Capture app screenshots for guides
4. **Create diagrams** - Use mermaid or draw.io
5. **Review and edit** - Proofread all content
6. **Test locally** - Build and test with GitBook
7. **Deploy** - Push to GitHub and deploy to GitBook.com

## 📧 Questions?

- Discord: [discord.gg/oraclex](https://discord.gg/oraclex)
- Email: docs@oraclex.ai
- GitHub: [github.com/oraclex/OracleX](https://github.com/oraclex/OracleX)

---

**Status**: 4/150+ pages complete  
**Last Updated**: November 9, 2025  
**Contributors**: OracleX Team
