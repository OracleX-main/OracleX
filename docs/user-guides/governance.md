# Governance Guide

Learn how to participate in OracleX governance and shape the future of the platform.

##  What is Governance?

OracleX uses a Decentralized Autonomous Organization (DAO) model where ORX token holders vote on protocol decisions.

**You can vote on:**
- Protocol parameter changes
- Treasury spending
- Feature additions
- Smart contract upgrades
- Community initiatives
- Dispute resolutions

**Power to the people** - No single entity controls OracleX!

##  Voting Power

### How Voting Power Works

```typescript
Voting Power = ORX Balance  Staking Multiplier

Examples:
1,000 ORX (not staked) = 1,000 votes
1,000 ORX (30-day stake) = 1,083 votes (+8.3%)
1,000 ORX (90-day stake) = 1,333 votes (+33.3%)
1,000 ORX (180-day stake) = 1,667 votes (+66.7%)
1,000 ORX (365-day stake) = 2,000 votes (+100%)
```

**Benefits of Staking:**
- More voting power
- Higher influence
- Governance rewards
- Priority proposals

### Checking Your Voting Power

```typescript
Go to: Governance Dashboard

Your Voting Power

ORX Balance: 5,000 ORX
Staked: 3,000 ORX (180 days)
Liquid: 2,000 ORX

Voting Power Breakdown:
Liquid: 2,000 votes
Staked: 3,000  1.667 = 5,001 votes
Total: 7,001 votes

Your Rank: #245 / 12,000 voters
Percentile: Top 2%

```

##  Proposal Types

### 1. Parameter Changes

Adjust protocol parameters:

**Examples:**
- Trading fee: 2%  1.5%
- Minimum market stake: 1,000  500 ORX
- Staking lock periods
- APY rates

**Requirements:**
- Proposer needs: 10,000 ORX
- Quorum: 10% of total votes
- Approval: 51% of votes
- Timelock: 48 hours

### 2. Treasury Spending

Allocate community funds:

**Examples:**
- Marketing campaigns: 50,000 ORX
- Developer grants: 100,000 ORX
- Bug bounties: 25,000 ORX
- Partnership deals: 200,000 ORX

**Requirements:**
- Proposer needs: 10,000 ORX
- Quorum: 20% of total votes
- Approval: 66% of votes
- Timelock: 7 days

### 3. Protocol Upgrades

Modify smart contracts:

**Examples:**
- Add new features
- Fix security issues
- Optimize gas costs
- Integrate new oracles

**Requirements:**
- Proposer needs: 50,000 ORX
- Quorum: 30% of total votes
- Approval: 75% of votes
- Timelock: 14 days

### 4. Emergency Actions

Critical situations:

**Examples:**
- Pause contracts
- Emergency withdrawals
- Security patches
- Oracle failures

**Requirements:**
- Proposer needs: 100,000 ORX
- Quorum: 40% of total votes
- Approval: 80% of votes
- Timelock: 24 hours (expedited)

##  Creating a Proposal

### Prerequisites

Before creating a proposal:

 **Requirements:**
- Minimum 10,000 ORX staked
- Wallet connected
- BNB for gas fees
- Well-researched proposal

 **Preparation:**
- Discuss in forums first
- Gather community feedback
- Create detailed specification
- Calculate impact

### Proposal Creation Process

#### Step 1: Navigate to Governance

1. Go to https://oraclex.com/governance
2. Click **"Create Proposal"**
3. Or visit: /governance/create

#### Step 2: Choose Proposal Type

Select from dropdown:
- Parameter Change
- Treasury Spending
- Protocol Upgrade
- Emergency Action

#### Step 3: Write Title

```typescript
 Good Titles:
"Reduce Trading Fees from 2% to 1.5%"
"Allocate 50,000 ORX for Q1 Marketing Campaign"
"Upgrade Staking Contract to v2.0"

 Bad Titles:
"Make fees better"
"Need money for stuff"
"Fix the thing"
```

#### Step 4: Write Description

Use markdown formatting:

```markdown
# Proposal: Reduce Trading Fees

## Summary
Reduce platform trading fees from 2% to 1.5% to increase competitiveness
and user adoption.

## Motivation
- Competitors charge 1-1.5% fees
- Lower fees = more volume
- Increased volume = more revenue overall
- Better user experience

## Specification
- Current fee: 2% (200 basis points)
- Proposed fee: 1.5% (150 basis points)
- Implementation: Update MarketFactory.sol parameter
- Timeline: Effective immediately after execution

## Expected Impact
- Volume increase: +40% (estimated)
- Revenue impact: +5% (40% volume  75% fee)
- User growth: +20% (more competitive pricing)

## Risks
- Short-term revenue decrease possible
- May need to adjust if volume doesn't increase
- Requires smart contract update

## Implementation Steps
1. DAO approves proposal
2. 48-hour timelock
3. Update contract parameter
4. Monitor impact for 30 days
5. Reassess if needed

## Budget
No direct costs. Potential revenue impact in transition period.

## Team
Lead: @OracleX Core Team
Support: @Community Marketing Group

## Timeline
- Voting Period: 7 days
- Timelock: 48 hours
- Implementation: Immediate
- Review: 30 days post-launch
```

#### Step 5: Set Voting Period

Choose duration:
- Minimum: 3 days
- Recommended: 7 days
- Maximum: 30 days

**Considerations:**
- Urgent matters: 3 days
- Standard proposals: 7 days
- Major changes: 14-30 days

#### Step 6: Add Supporting Documents

Attach:
- Technical specifications
- Financial analysis
- Community poll results
- Expert opinions
- Code changes (if applicable)

#### Step 7: Review & Submit

```typescript
Proposal Summary

Type: Parameter Change
Title: Reduce Trading Fees from 2% to 1.5%
Voting Period: 7 days
Required Quorum: 10%
Required Approval: 51%
Your Stake: 15,000 ORX 
Cost: ~$0.05 gas

```

#### Step 8: Submit Transaction

1. Click **"Submit Proposal"**
2. Sign transaction in MetaMask
3. Wait for confirmation
4. Proposal is now live!

##  Voting on Proposals

### Finding Active Proposals

```typescript
Governance Dashboard

Active Proposals (12)


Proposal #47: Reduce Trading Fees to 1.5%
Status: Active (4 days left)
Quorum: 12.5% / 10% 
Yes: 125,000 (68%)
No: 59,000 (32%)
Your Vote: Not voted

Proposal #48: Allocate 50K ORX for Marketing
Status: Active (6 days left)
Quorum: 8.2% / 20% 
Yes: 82,000 (75%)
No: 28,000 (25%)
Your Vote: YES 

Proposal #49: Upgrade Staking Contract
Status: Active (13 days left)
Quorum: 5.1% / 30% 
Yes: 51,000 (60%)
No: 34,000 (40%)
Your Vote: Not voted

```

### How to Vote

#### Step 1: Review Proposal

Click proposal to see details:
- Full description
- Discussion comments
- Current vote tallies
- Time remaining
- Historical context

#### Step 2: Research

Before voting:
-  Read full proposal
-  Check discussion forum
-  Review supporting docs
-  Consider implications
-  Verify legitimacy

#### Step 3: Cast Your Vote

```typescript
Vote on Proposal #47

Your Voting Power: 7,001 votes

Choose Your Vote:
[ ] YES - Support this proposal
[ ] NO - Reject this proposal
[ ] ABSTAIN - Neither support nor reject

Voting Impact:
Current: YES 68% / NO 32%
If you vote YES: 68.1% / 31.9%
If you vote NO: 67.8% / 32.2%

Your vote represents 0.7% of total votes needed.

Gas Cost: ~$0.03
```

#### Step 4: Confirm Vote

1. Select YES, NO, or ABSTAIN
2. Click **"Cast Vote"**
3. Sign transaction
4. Vote recorded on-chain

**Important:** 
- Votes are final (cannot change)
- Public record (visible to all)
- Counted immediately

### Vote Delegation

Can't vote on everything? Delegate!

```typescript
Delegate Your Votes

Current Voting Power: 7,001 votes
Delegated To: None

How Delegation Works:
1. Choose a trusted delegate
2. They vote with your power
3. You can undelegate anytime
4. You retain ORX ownership

Top Delegates:

1. @CryptoExpert (250K votes delegated)
   - 42 proposals voted
   - 89% community approval
   - Focuses on: Technical proposals

2. @CommunityFirst (180K votes delegated)
   - 38 proposals voted
   - 92% community approval
   - Focuses on: Treasury, marketing

3. @SecurityFocused (160K votes delegated)
   - 31 proposals voted
   - 95% community approval
   - Focuses on: Protocol security


Delegate To: [Enter address or ENS]
[Delegate Votes] [Cancel]
```

##  Proposal Lifecycle

### Stage 1: Discussion (Pre-Proposal)

```
Duration: Informal
Platform: Forum, Discord
Purpose: Gauge community interest
```

**Activities:**
- Post in forum
- Discuss pros/cons
- Refine idea
- Build support

### Stage 2: Formal Proposal

```
Duration: Voting period (3-30 days)
Platform: On-chain governance
Purpose: Official vote
```

**Activities:**
- Submit on-chain
- Community votes
- Reach quorum
- Pass/fail determined

### Stage 3: Timelock

```
Duration: 48 hours - 14 days
Platform: Smart contract
Purpose: Security buffer
```

**Activities:**
- Proposal queued
- Review period
- Can be canceled if issues found
- Emergency pause possible

### Stage 4: Execution

```
Duration: Immediate
Platform: Smart contracts
Purpose: Implement changes
```

**Activities:**
- Execute transaction
- Update parameters
- Deploy changes
- Monitor impact

### Stage 5: Post-Implementation

```
Duration: Ongoing
Platform: Analytics
Purpose: Measure success
```

**Activities:**
- Track metrics
- Gather feedback
- Adjust if needed
- Document learnings

##  Quorum & Approval

### Understanding Quorum

**Quorum** = Minimum participation needed

```typescript
Example:
Total Voting Power: 100M ORX
Quorum Required: 10%
Minimum Votes Needed: 10M ORX

Current Votes: 12M ORX  (Quorum reached)
YES: 8M (66.7%)
NO: 4M (33.3%)
Result: PASSED (>51% approval)
```

### Approval Thresholds

| Proposal Type | Quorum | Approval |
|---------------|--------|----------|
| Parameter Change | 10% | 51% |
| Treasury Spending | 20% | 66% |
| Protocol Upgrade | 30% | 75% |
| Emergency Action | 40% | 80% |

### What Happens if Quorum Not Met?

```typescript
Scenario 1: Quorum not reached
- Proposal fails
- No changes made
- Can be re-submitted

Scenario 2: Quorum reached, approval not met
- Proposal rejected
- No changes made
- Community decision respected

Scenario 3: Both quorum & approval met
- Proposal passes
- Enters timelock
- Will be executed
```

##  Governance Rewards

### Earn for Participation

Active voters earn rewards:

```typescript
Voting Rewards

Your Stats:
Proposals Voted: 15
Voting Rate: 75% (15/20 proposals)
Delegation Status: Self

Rewards Earned:
Base Reward: 50 ORX
Consistency Bonus: 15 ORX (+30%)
Total: 65 ORX

Next Reward: Vote on 5 more proposals
Unlock: 100 ORX milestone reward

```

### Reward Structure

- **Per Vote**: 2-5 ORX (based on proposal importance)
- **Consistency Bonus**: +10% for 10+ consecutive votes
- **Delegation Reward**: 1 ORX per proposal (delegates earn more)
- **Milestone Rewards**: Bonus at 10, 50, 100, 500 votes

##  Governance Achievements

Unlock badges:

-  **First Vote**: Cast your first vote
-  **First Proposal**: Create first proposal
-  **10 Votes**: Voted on 10 proposals
-  **100% Participation**: Voted on all proposals in a quarter
-  **Trusted Delegate**: Received 10,000+ delegated votes
-  **DAO Architect**: Created 10 successful proposals
-  **Governance Legend**: 1,000+ votes cast

##  Best Practices

### For Voters

** DO:**
- Read full proposals
- Participate in discussions
- Vote consistently
- Consider long-term impact
- Delegate if too busy

** DON'T:**
- Vote blindly
- Follow whales without thinking
- Ignore context
- Vote emotionally
- Sell votes (against ToS)

### For Proposers

** DO:**
- Research thoroughly
- Discuss in forums first
- Provide detailed specs
- Address concerns
- Follow up post-implementation

** DON'T:**
- Rush proposals
- Ignore feedback
- Make unrealistic promises
- Forget about execution
- Abandon after approval

##  Resources

- **Governance Dashboard**: https://oraclex.com/governance
- **Forum**: https://forum.oraclex.com
- **Proposals Archive**: https://oraclex.com/governance/history
- **Voting Guide**: https://docs.oraclex.com/governance

## Next Steps

Get involved in governance:

1.  [View Active Proposals ](https://oraclex.com/governance)
2.  [Join Discussion Forum ](https://forum.oraclex.com)
3.  [Increase Voting Power ](staking-guide.md)

---

<div style="background: linear-gradient(135deg, #FFD700, #9333EA); padding: 1.5rem; border-radius: 12px; color: white;">
  <strong> Your Voice Matters!</strong> Participate in OracleX governance and help shape the future of decentralized prediction markets.
</div>

