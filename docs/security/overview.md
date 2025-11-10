# Security Overview

OracleX takes security seriously. This document outlines our security measures, best practices, and how we protect user funds.

##  Smart Contract Security

### Audit Status

| Contract | Auditor | Date | Status | Report |
|----------|---------|------|--------|--------|
| ORX Token | CertiK | Sep 2025 |  Passed | [View Report ](#) |
| Market Factory | CertiK | Sep 2025 |  Passed | [View Report ](#) |
| Staking | CertiK | Sep 2025 |  Passed | [View Report ](#) |
| Governance | CertiK | Sep 2025 |  Passed | [View Report ](#) |
| Dispute Resolution | CertiK | Oct 2025 |  Passed | [View Report ](#) |
| Oracle Bridge | CertiK | Oct 2025 |  Passed | [View Report ](#) |

**Key Findings:**
- 0 Critical Issues
- 0 High Severity Issues  
- 2 Medium Issues (Fixed)
- 5 Low Issues (Fixed)
- 8 Informational Notes (Addressed)

### Security Features

#### 1. Access Control

```solidity
// Role-based access control
contract OracleXMarketFactory {
    address public owner;
    address public oracleAddress;
    mapping(address => bool) public admins;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Not oracle");
        _;
    }
    
    modifier onlyAdmin() {
        require(admins[msg.sender], "Not admin");
        _;
    }
}
```

#### 2. Reentrancy Protection

```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract OracleXStaking is ReentrancyGuard {
    function unstake(uint256 stakeId) 
        external 
        nonReentrant  // Prevents reentrancy
        returns (uint256)
    {
        // Safe withdrawal logic
    }
}
```

#### 3. Safe Math

```solidity
// Using Solidity 0.8+ built-in overflow checks
// All arithmetic operations automatically checked

uint256 total = amount1 + amount2;  // Reverts on overflow
uint256 reward = stake * apy / 10000;  // Safe math
```

#### 4. Input Validation

```solidity
function stake(uint256 amount, uint256 lockPeriod) external {
    require(amount >= minimumStake, "Amount too low");
    require(
        lockPeriod == 30 days ||
        lockPeriod == 90 days ||
        lockPeriod == 180 days ||
        lockPeriod == 365 days,
        "Invalid lock period"
    );
    // ... rest of function
}
```

#### 5. Emergency Pause

```solidity
import "@openzeppelin/contracts/security/Pausable.sol";

contract OracleXStaking is Pausable {
    function stake(uint256 amount, uint256 lockPeriod) 
        external 
        whenNotPaused  // Can be paused in emergency
    {
        // Staking logic
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
```

#### 6. Time Locks

```solidity
// Critical operations have time delays
contract Governance {
    uint256 public constant TIMELOCK = 2 days;
    
    struct Proposal {
        uint256 executionTime;
        bool executed;
    }
    
    function executeProposal(uint256 proposalId) external {
        Proposal storage prop = proposals[proposalId];
        require(
            block.timestamp >= prop.executionTime,
            "Timelock not expired"
        );
        require(!prop.executed, "Already executed");
        
        // Execute proposal
        prop.executed = true;
    }
}
```

##  User Security Best Practices

### Wallet Security

####  DO:

1. **Use Hardware Wallets**
   - Ledger Nano S/X
   - Trezor Model T/One
   - For amounts > $1,000

2. **Secure Seed Phrase**
   ```
    Write on paper
    Store in fireproof safe
    Make multiple copies
    Store in different locations
    Never digitize
   ```

3. **Strong Passwords**
   - 12+ characters
   - Mix letters, numbers, symbols
   - Unique for each service
   - Use password manager

4. **Enable 2FA**
   - Use authenticator apps
   - Avoid SMS 2FA
   - Backup codes stored safely

5. **Verify Addresses**
   - Always double-check addresses
   - Use ENS names when possible
   - Test with small amounts first

####  DON'T:

1. **Never Share**
   - Private keys
   - Seed phrases
   - Passwords
   - With anyone, ever

2. **Avoid**
   - Screenshots of seed phrases
   - Storing seeds in cloud
   - Using exchange wallets for DeFi
   - Clicking suspicious links
   - Connecting to unknown sites

3. **Beware**
   - Phishing attempts
   - Fake support DMs
   - Too-good-to-be-true airdrops
   - Urgent "security" messages
   - Impersonators

### Transaction Security

#### Before Signing

```typescript
// Always verify transaction details
const transaction = {
  to: "0x273C8Dde70897069BeC84394e235feF17e7c5E1b", //  Correct contract
  value: "1000000000000000000000", //  1,000 ORX
  data: "0x...", //  Expected function call
  gasLimit: "150000", //  Reasonable gas
  gasPrice: "5000000000" //  Fair gas price
};

// Checklist:
//  Contract address is correct
//  Amount is what you expect
//  Function call is legitimate
//  Gas settings are reasonable
//  You initiated this action
```

#### Red Flags

 **Stop and investigate if:**
- Unexpected approval requests
- Very high gas fees
- Unknown contract addresses
- Requests to sign message (not transaction)
- Urgent "act now" pressure
- Suspicious function names

### Smart Contract Interactions

#### Safe Approval Pattern

```typescript
// Option 1: Approve exact amount (safer)
await orxToken.approve(
  stakingAddress,
  ethers.parseEther("1000") // Only what you need
);

// Option 2: Approve unlimited (convenient but riskier)
await orxToken.approve(
  stakingAddress,
  ethers.MaxUint256 // Unlimited approval
);

// Option 3: Revoke approval when done
await orxToken.approve(
  stakingAddress,
  0 // Revoke approval
);
```

#### Verify Contract Code

```typescript
// Before interacting, verify on BSCScan
const contractAddress = "0x273C8Dde70897069BeC84394e235feF17e7c5E1b";

// Check:
//  Contract is verified
//  Source code is public
//  Matches expected code
//  Has audit reports
//  Creation date is reasonable

// View on BSCScan:
// https://testnet.bscscan.com/address/0x273C8Dde70897069BeC84394e235feF17e7c5E1b#code
```

##  Common Attacks & Prevention

### 1. Phishing

**Attack:** Fake websites mimicking OracleX

**Prevention:**
```typescript
// Always verify URL
const legitimate = "https://oraclex.com";
const phishing = [
  "https://orac1ex.com",      // Typo
  "https://oraclex-app.com",   // Extra word
  "https://oraclex.io",        // Wrong TLD
];

// Check:
 Bookmark official site
 Verify SSL certificate
 Check domain registration
 Look for verified social media
```

### 2. Approval Exploits

**Attack:** Malicious contracts draining approved tokens

**Prevention:**
```typescript
// Minimize approvals
// Revoke unused approvals
// Use tools like Revoke.cash

// Check current approvals
const allowance = await orxToken.allowance(
  userAddress,
  unknownContract
);

if (allowance > 0) {
  // Revoke if suspicious
  await orxToken.approve(unknownContract, 0);
}
```

### 3. Front-Running

**Attack:** MEV bots front-running your transactions

**Prevention:**
```typescript
// Use private RPC endpoints
const privateRPC = "https://rpc.flashbots.net";

// Set slippage limits
const slippage = 0.5; // 0.5% max

// Use flashbots for large transactions
```

### 4. Rug Pulls

**Attack:** Malicious projects stealing funds

**Prevention:**
```typescript
// Check liquidity locks
// Verify contract ownership
// Review tokenomics
// Check team credentials
// Start with small amounts

// OracleX safety:
 Contracts are immutable or DAO-controlled
 Liquidity will be locked
 Team vesting schedules
 Public audit reports
 Open-source code
```

### 5. Social Engineering

**Attack:** Scammers impersonating team/support

**Prevention:**
```
 Team never DMs first
 No "verify wallet" requests
 No seed phrase requests ever
 Support only through official channels
 Check verified badges
```

##  Monitoring & Alerts

### On-Chain Monitoring

```typescript
// Monitor your transactions
const monitorAddress = async (address) => {
  // Set up event listeners
  orxToken.on(orxToken.filters.Transfer(address), (from, to, amount) => {
    if (from === address) {
      console.log(` ${ethers.formatEther(amount)} ORX sent to ${to}`);
      // Alert if unexpected
    }
  });
  
  // Monitor approvals
  orxToken.on(orxToken.filters.Approval(address), (owner, spender, amount) => {
    console.log(` Approval: ${ethers.formatEther(amount)} to ${spender}`);
    // Alert if unknown spender
  });
};
```

### Security Tools

1. **Revoke.cash** - Manage token approvals
   - https://revoke.cash

2. **BscScan Alerts** - Transaction notifications
   - https://bscscan.com/myaccount

3. **Wallet Watch** - Monitor balances
   - Custom scripts or services

4. **Tenderly** - Transaction simulation
   - Test transactions before sending

##  Bug Bounty Program

### Scope

We reward security researchers who find vulnerabilities:

| Severity | Reward | Examples |
|----------|--------|----------|
| **Critical** | 10,000-50,000 ORX | Funds at risk, contract takeover |
| **High** | 5,000-10,000 ORX | Unauthorized access, data breach |
| **Medium** | 1,000-5,000 ORX | Logic errors, griefing attacks |
| **Low** | 100-1,000 ORX | Minor issues, improvements |

### In Scope

 **Eligible:**
- Smart contracts (all contracts)
- Backend API vulnerabilities
- Frontend security issues
- AI Oracle exploits
- Authentication bypasses

 **Not Eligible:**
- Already known issues
- Theoretical attacks
- Social engineering
- DDoS attacks
- Issues in third-party code

### Reporting

```markdown
# Security Report Template

## Summary
Brief description of the vulnerability

## Severity
Critical / High / Medium / Low

## Affected Component
- Smart contract: [address]
- Function: [function name]
- Or: Backend API endpoint / Frontend component

## Steps to Reproduce
1. Step 1
2. Step 2
3. ...

## Proof of Concept
```code or transaction hash```

## Impact
What could an attacker do?

## Recommended Fix
How to patch the vulnerability

## Contact
- Email: security@oraclex.com
- PGP Key: [if available]
```

**Email:** security@oraclex.com  
**Response Time:** Within 24 hours  
**Fix Timeline:** Critical issues patched within 48 hours

##  Security Metrics

### Current Status

```typescript
const securityMetrics = {
  contractsAudited: 6,
  auditsCompleted: 6,
  criticalIssuesFound: 0,
  criticalIssuesFixed: 0,
  
  tvl: "$50M",
  daysSinceIncident: 180,
  bugBountiesPaid: 25000, // ORX
  
  uptime: "99.98%",
  responseTime: "< 24h",
  patchTime: "< 48h critical",
  
  multisigSigners: 5,
  timelockDuration: "48 hours",
  adminKeys: "DAO-controlled"
};
```

##  Resources

- **Security Email**: security@oraclex.com
- **Bug Bounty**: https://oraclex.com/bug-bounty
- **Audit Reports**: https://oraclex.com/audits
- **Smart Contracts**: https://github.com/abdussalam-mustapha/OracleX/tree/main/contracts

## Emergency Contacts

| Issue | Contact | Response Time |
|-------|---------|---------------|
| **Critical Vulnerability** | security@oraclex.com | < 1 hour |
| **Contract Bug** | dev@oraclex.com | < 2 hours |
| **User Fund Issue** | support@oraclex.com | < 24 hours |
| **General Security** | Discord #security | Community |

---

<div style="background: linear-gradient(135deg, #FFD700, #9333EA); padding: 1.5rem; border-radius: 12px; color: white;">
  <strong> Security First:</strong> Your safety is our priority. Report vulnerabilities responsibly and help us keep OracleX secure for everyone.
</div>

