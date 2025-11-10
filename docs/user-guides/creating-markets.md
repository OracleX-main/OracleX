# Creating Markets Guide

Learn how to create prediction markets on OracleX and build your own community.

##  What is Market Creation?

As a market creator, you define a question about the future that others can predict on. You become the curator of that prediction community.

**Requirements:**
- 1,000 ORX stake (refunded after fair resolution)
- Clear, verifiable question
- Reliable resolution source
- Active wallet with BNB for gas

##  Why Create Markets?

### Benefits

1. **Build Community**: Gather people around topics you care about
2. **Earn Reputation**: Gain recognition as a market creator
3. **Influence Discussion**: Shape conversations on important topics
4. **Participation**: Predict on your own markets
5. **Impact**: Help others make informed decisions

### Responsibilities

-  Write clear, unambiguous questions
-  Choose fair resolution sources
-  Monitor market for issues
-  Ensure proper resolution
-  Stake can be slashed if market is disputed

##  Market Creation Process

### Step 1: Navigate to Create Market

1. Go to **Markets** page
2. Click **"Create Market"** button (top right)
3. Or visit: https://oraclex.com/markets/create

### Step 2: Define Your Question

#### Writing Good Questions

** Good Questions:**
```
"Will Bitcoin reach $100,000 before January 1, 2026?"
- Clear outcome criteria
- Specific timeframe
- Verifiable result

"Will Team A defeat Team B in the Championship Final?"
- Binary outcome
- Specific event
- Known resolution date

"Will the Fed raise interest rates in Q4 2025?"
- Definite yes/no
- Time-bound
- Public information source
```

** Bad Questions:**
```
"Will Bitcoin do well?"
- Vague outcome
- No timeframe
- Subjective

"Is AI dangerous?"
- Opinion-based
- No clear resolution
- Subjective

"Who is the best player?"
- Subjective
- No criteria
- No source
```

#### Question Best Practices

1. **Be Specific**
   - Use exact dates and times
   - Define clear thresholds
   - Specify all conditions

2. **Be Objective**
   - Avoid subjective terms
   - Use measurable criteria
   - Stick to facts

3. **Be Time-Bound**
   - Set clear end date
   - Allow reasonable time for resolution
   - Consider time zones

4. **Be Unambiguous**
   - One interpretation only
   - Define edge cases
   - Clear success criteria

### Step 3: Select Category

Choose the most relevant category:

| Category | Examples |
|----------|----------|
|  **Sports** | Game outcomes, championships, player stats |
|  **Politics** | Elections, policy changes, government decisions |
|  **Crypto** | Price predictions, protocol launches, adoption |
|  **Entertainment** | Award shows, box office, streaming releases |
|  **World Events** | International relations, climate, major events |
|  **Science & Tech** | Product launches, scientific discoveries, innovation |

### Step 4: Set Resolution Source

Define how the outcome will be determined.

#### Types of Sources

**1. Price Oracles**
```typescript
Source: "CoinGecko API"
Criteria: "Bitcoin USD price at 00:00 UTC on Jan 1, 2026"
URL: "https://www.coingecko.com/en/coins/bitcoin"
```

**2. Official Announcements**
```typescript
Source: "Federal Reserve Official Website"
Criteria: "Interest rate decision announced in FOMC statement"
URL: "https://www.federalreserve.gov"
```

**3. Sports Results**
```typescript
Source: "ESPN Official Scores"
Criteria: "Final score at end of regulation play"
URL: "https://www.espn.com"
```

**4. News Aggregators**
```typescript
Source: "Reuters"
Criteria: "Official confirmation published by Reuters"
URL: "https://www.reuters.com"
```

**5. Blockchain Data**
```typescript
Source: "BscScan"
Criteria: "Transaction confirmed on-chain"
URL: "https://bscscan.com"
```

#### Resolution Source Requirements

 **Must have:**
- Publicly accessible
- Reliable and trusted
- Updated regularly
- Free to access
- Timestamped data

 **Avoid:**
- Personal websites
- Paywalled content
- Unreliable sources
- Subjective sources
- Easily manipulated data

### Step 5: Set End Time

Choose when betting closes:

```typescript
// Minimum: 24 hours from creation
// Maximum: 1 year from creation

Short-term: 24-48 hours
- Breaking news
- Daily sports events
- Quick markets

Medium-term: 1 week - 1 month
- Weekly sports
- Monthly economic data
- Product launches

Long-term: 1-12 months
- Elections
- Annual predictions
- Major milestones
```

**Tips:**
- Allow enough time for people to discover market
- End before event occurs (not when it resolves)
- Consider time zones for global events
- Add buffer for resolution verification

### Step 6: Define Outcomes

#### Binary Markets (YES/NO)

Most common market type:
- Simple yes or no question
- Two possible outcomes
- Easy to understand

```typescript
Question: "Will Bitcoin reach $100k in 2025?"
Outcomes:
- YES: Bitcoin hits $100,000 or more
- NO: Bitcoin stays below $100,000
```

#### Multiple Choice Markets

For questions with multiple possible outcomes:

```typescript
Question: "Which team will win the World Cup?"
Outcomes:
- Team A
- Team B
- Team C
- Team D
- Other

(Maximum 6 outcomes)
```

**Requirements:**
- Mutually exclusive outcomes
- Collectively exhaustive (cover all possibilities)
- Clear definitions for each
- Consider "Other" option if needed

### Step 7: Add Description (Optional)

Provide additional context:

```markdown
# Market Context

This market resolves based on the official CoinGecko price 
at 00:00 UTC on January 1, 2026.

## Resolution Criteria

- YES: If BTC >= $100,000.00
- NO: If BTC < $100,000.00

## Data Source

Price will be checked on CoinGecko's historical data:
https://www.coingecko.com/en/coins/bitcoin

## Edge Cases

- If CoinGecko is down: Alternative source CoinMarketCap
- Price snapshots taken at exact UTC midnight
- Rounding to nearest cent

## Dispute Policy

Disputes must be filed within 24 hours of resolution 
with clear evidence of incorrect outcome.
```

### Step 8: Review & Stake

Before creating:

**Review Checklist:**
-  Question is clear and specific
-  Category is correct
-  Resolution source is reliable
-  End time is appropriate
-  Outcomes are well-defined
-  Description provides context
-  You have 1,000 ORX + gas fees

**Stake Information:**
```typescript
Creator Stake: 1,000 ORX
Gas Fee: ~0.01 BNB (~$3)
Total Cost: 1,000 ORX + gas

Stake Returns:
- Fair resolution: 100% refund + reputation
- Disputed & upheld: 100% refund
- Disputed & overturned: Partial/full slash
```

### Step 9: Confirm Transactions

**Transaction 1: Approve ORX**
1. MetaMask popup appears
2. Click "Approve"
3. Wait for confirmation (~3 seconds)

**Transaction 2: Create Market**
1. Second MetaMask popup
2. Review details
3. Click "Confirm"
4. Wait for confirmation (~3 seconds)

**Success:**
- Market is live immediately
- You're redirected to market page
- 1,000 ORX is staked
- Market appears in your profile

##  After Creation

### Promote Your Market

1. **Share Link**
   ```
   https://oraclex.com/markets/[your-market-id]
   ```

2. **Social Media**
   - Twitter: Share with relevant hashtags
   - Discord: Post in appropriate channels
   - Telegram: Share in crypto groups
   - Reddit: Relevant subreddits

3. **Make First Prediction**
   - Show confidence in your market
   - Set initial odds
   - Encourage participation

### Monitor Activity

Track your market:
- Total volume
- Number of predictions
- Odds movement
- Time remaining
- AI confidence score

### Engage Community

- Respond to questions
- Share updates
- Clarify ambiguities
- Build excitement

##  Resolution Process

### Automatic Resolution

OracleX uses TruthMesh AI to resolve markets:

**Step 1: Market Closes**
- Betting ends at specified time
- No more predictions accepted
- Resolution countdown begins

**Step 2: AI Oracle Checks**
- TruthMesh agents activate
- Fetch data from resolution source
- Analyze outcome
- Reach consensus

**Step 3: Outcome Determined**
- AI confidence > 90%: Auto-resolve
- AI confidence < 90%: Manual review
- Disputed: Community voting

**Step 4: Distribution**
- Winners can claim rewards
- Your 1,000 ORX stake returned
- Reputation points awarded

### Time Frames

```typescript
Market closes: End time specified
Resolution check: Within 1 hour
Auto-resolution: Within 24 hours
Manual review: 24-48 hours
Dispute period: 48 hours after resolution
Final: Resolution becomes final
```

##  Dispute Handling

### When Disputes Occur

Markets can be disputed if:
- Outcome is incorrect
- Resolution source was wrong
- Criteria not followed
- Edge case occurred

### Dispute Process

1. **Filing Period**: 48 hours after resolution
2. **Challenger Stakes**: 1,000 ORX to dispute
3. **Evidence Required**: Proof of incorrect outcome
4. **Community Votes**: DAO members vote
5. **Resolution**: Majority decides outcome

### Impact on Creator

**If Dispute Upheld (You Were Wrong):**
```typescript
Your Stake: Slashed 50% (500 ORX penalty)
Goes To: Challenger
Remaining: Returned to you (500 ORX)
Reputation: Decreases
```

**If Dispute Rejected (You Were Right):**
```typescript
Your Stake: Fully refunded (1,000 ORX)
Challenger Stake: Distributed to voters
Reputation: Increases (bonus for fair market)
```

##  Market Analytics

### Track Performance

View stats for your markets:
- Total volume generated
- Number of participants
- Prediction distribution
- Resolution accuracy
- Dispute history
- Creator reputation

### Leaderboards

Compete as a creator:
- Most volume generated
- Most participants
- Highest accuracy
- Most markets created
- Best reputation

##  Advanced Tips

### Creating Viral Markets

1. **Trending Topics**
   - Follow news cycles
   - Jump on breaking stories
   - Tap into current events

2. **Controversial Questions**
   - Polarizing topics
   - Unexpected predictions
   - Challenge consensus

3. **Time-Sensitive**
   - React to announcements
   - Predict imminent events
   - Create FOMO

### Building Market Series

Create related markets:
```typescript
// Example: NFL Season Series
"Will [Team] win Week 1?"
"Will [Team] win Week 2?"
...
"Will [Team] make playoffs?"
"Will [Team] win Super Bowl?"

// Benefits:
- Recurring participants
- Build following
- Compound interest
```

### Niche Markets

Specialize in specific categories:
- Become known expert
- Build loyal community
- Higher quality predictions
- Better engagement

##  What NOT to Do

### Prohibited Markets

 **Illegal Activities**
- Assassination markets
- Illegal gambling
- Criminal activity

 **Harmful Content**
- Violence or harm
- Hateful content
- Personal attacks

 **Manipulable Markets**
- Easily gamed outcomes
- Self-fulfilling prophecies
- Insider trading

 **Ambiguous Questions**
- No clear resolution
- Subjective outcomes
- Vague criteria

### Penalties

Violating guidelines results in:
- Market removal
- Stake slashing (100%)
- Account suspension
- Reputation penalty
- Possible ban

##  Examples

### Example 1: Crypto Price

```typescript
Question: "Will Ethereum reach $5,000 before July 1, 2025?"
Category: Crypto
End Time: June 30, 2025 23:59 UTC
Resolution Source: CoinGecko API
Outcomes: YES / NO

Description:
"This market resolves YES if Ethereum (ETH) reaches or 
exceeds $5,000 USD at any point before July 1, 2025 00:00 UTC, 
as reported by CoinGecko. The price will be checked using 
CoinGecko's historical data and API."
```

### Example 2: Sports Event

```typescript
Question: "Will Liverpool FC win the Premier League 2024/25?"
Category: Sports
End Time: May 25, 2025 23:59 UTC
Resolution Source: Premier League Official
Outcomes: YES / NO

Description:
"Market resolves YES if Liverpool FC is crowned Premier League 
champion for the 2024/25 season. Resolution based on official 
Premier League standings at end of season."
```

### Example 3: Product Launch

```typescript
Question: "Will Apple release VR headset in 2025?"
Category: Science & Tech
End Time: Dec 31, 2025 23:59 UTC
Resolution Source: Apple Press Releases
Outcomes: YES / NO

Description:
"Resolves YES if Apple officially announces and releases a 
consumer VR/AR headset product during 2025. Announcement alone 
is not sufficient - product must be available for purchase."
```

##  Resources

- **Create Market**: https://oraclex.com/markets/create
- **Your Markets**: https://oraclex.com/profile?tab=markets
- **Market Guidelines**: https://docs.oraclex.com/policies
- **Community Forum**: https://forum.oraclex.com

## Next Steps

Ready to create your first market?

1.  [Get 1,000 ORX from Faucet ](getting-orx.md)
2.  [Join Creator Community ](https://discord.gg/oraclex)
3.  [View Example Markets ](https://oraclex.com/markets)

---

<div style="background: linear-gradient(135deg, #FFD700, #9333EA); padding: 1.5rem; border-radius: 12px; color: white;">
  <strong> Become a Creator!</strong> Shape the future of prediction markets by creating meaningful questions that engage the community. Your market, your rules!
</div>

