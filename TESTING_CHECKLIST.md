# OracleX Testing Checklist

## Prerequisites Setup
- [ ] MetaMask installed in browser
- [ ] MetaMask connected to BSC Testnet (Chain ID: 97)
- [ ] Test BNB in wallet for gas fees (get from https://testnet.bnbchain.org/faucet-smart)
- [ ] ORX tokens in wallet (need to get from token contract or faucet)
- [ ] Backend server running (`cd backend && npm run dev`)
- [ ] Frontend server running (`cd frontend && npm run dev`)

## Contract Addresses (BSC Testnet)
```
ORX Token: 0x7eE4f73bab260C11c68e5560c46E3975E824ed79
Staking: 0x007Aaa957829ea04e130809e9cebbBd4d06dABa2
Governance: 0x0b88B36631911efeBe9Dd6395Fb6DA635B1EfF8F
Disputes: 0x5fd54e5e037939C93fAC248E39459b168d741502
```

## Staking Page Tests

### View Staking Data
- [ ] Navigate to `/staking`
- [ ] Verify total staked amount displays
- [ ] Verify available balance shows (may be 0 if no ORX tokens)
- [ ] Verify pending rewards shows
- [ ] Verify current APY displays

### Stake Tokens
- [ ] Enter stake amount (e.g., 100 ORX)
- [ ] Select lock period (30, 90, 180, or 365 days)
- [ ] Check estimated annual rewards calculation
- [ ] Click "Stake ORX"
- [ ] Confirm transaction in MetaMask
- [ ] Wait for success notification
- [ ] Verify total staked amount increased
- [ ] Verify pending rewards updated

### Unstake Tokens
- [ ] Switch to "Unstake" tab
- [ ] Enter unstake amount
- [ ] Check unlock date displayed
- [ ] Click "Unstake ORX"
- [ ] Confirm transaction in MetaMask
- [ ] Verify success (or error if lock period not expired)
- [ ] Verify staked amount decreased if successful

### Claim Rewards
- [ ] Check pending rewards amount
- [ ] Click "Claim Rewards"
- [ ] Confirm transaction in MetaMask
- [ ] Wait for success notification
- [ ] Verify pending rewards reset to 0 or lower amount
- [ ] Check wallet balance increased

## Governance Page Tests

### View Proposals
- [ ] Navigate to `/governance`
- [ ] Verify proposals list loads
- [ ] Check "Active" tab shows active proposals only
- [ ] Check "Passed" tab shows completed proposals
- [ ] Check "All" tab shows all proposals
- [ ] Verify each proposal shows:
  - Title and description
  - Status badge (Active/Passed/Rejected)
  - For/Against vote counts
  - End date
  - Voting progress bar
  - Quorum progress bar

### Vote on Proposal
- [ ] Find an active proposal
- [ ] Click "Vote For" or "Vote Against"
- [ ] Confirm transaction in MetaMask
- [ ] Wait for success notification
- [ ] Verify vote counts updated
- [ ] Verify progress bars updated
- [ ] Try voting again (should fail - already voted)

### Create Proposal (if you have 10,000 ORX)
- [ ] Click "Create Proposal" button
- [ ] Fill in proposal title and description
- [ ] Submit proposal
- [ ] Confirm transaction in MetaMask
- [ ] Verify new proposal appears in list

## Disputes Page Tests

### View Disputes
- [ ] Navigate to `/disputes`
- [ ] Verify disputes list loads
- [ ] Check each dispute shows:
  - Market ID
  - Challenger address
  - Evidence text
  - Status badge
  - For/Against vote counts
  - Voting end date
  - Stake amount required
  - Community vote progress

### Vote on Dispute
- [ ] Find an active dispute
- [ ] Read the evidence submitted
- [ ] Click "Vote For" or "Vote Against"
- [ ] Confirm transaction in MetaMask
- [ ] Wait for success notification
- [ ] Verify vote counts updated
- [ ] Verify progress bar updated
- [ ] Try voting again (should fail - already voted)

## Error Handling Tests

### Wallet Not Connected
- [ ] Disconnect MetaMask
- [ ] Try to stake tokens
- [ ] Verify error message: "Please connect your wallet first"
- [ ] Try to vote on proposal
- [ ] Verify same error message
- [ ] Try to vote on dispute
- [ ] Verify same error message

### Invalid Inputs
- [ ] Try staking 0 ORX
- [ ] Verify error or button disabled
- [ ] Try staking more than available balance
- [ ] Verify MetaMask shows insufficient funds error
- [ ] Try unstaking more than staked amount
- [ ] Verify contract reverts transaction

### Transaction Failures
- [ ] Set very low gas limit in MetaMask
- [ ] Try any transaction
- [ ] Verify error is caught and displayed
- [ ] Verify loading state resets

### Network Issues
- [ ] Temporarily disconnect internet
- [ ] Try loading any page
- [ ] Verify error message shown
- [ ] Reconnect internet
- [ ] Verify data loads

## Integration Tests

### Full Staking Flow
- [ ] Start with 0 staked
- [ ] Stake 100 ORX for 90 days
- [ ] Wait for transaction
- [ ] Verify staked amount = 100
- [ ] Wait a few blocks for rewards to accumulate
- [ ] Check pending rewards > 0
- [ ] Claim rewards
- [ ] Verify rewards claimed
- [ ] Try to unstake immediately (should fail - locked)

### Full Governance Flow
- [ ] Check voting power (should show if you have staked ORX)
- [ ] Find active proposal
- [ ] Vote For
- [ ] Wait for transaction
- [ ] Check proposal stats updated
- [ ] Wait for voting period to end
- [ ] Check if proposal passed (based on quorum/approval)

### Full Dispute Flow
- [ ] View active dispute
- [ ] Check can vote (need staked ORX)
- [ ] Vote on outcome
- [ ] Wait for transaction
- [ ] Check vote recorded
- [ ] Wait for voting period to end
- [ ] Check if dispute upheld or rejected

## Performance Tests

### Page Load Times
- [ ] Measure Staking page load time (should be < 2s)
- [ ] Measure Governance page load time (should be < 2s)
- [ ] Measure Disputes page load time (should be < 2s)

### Transaction Speed
- [ ] Measure stake transaction time
- [ ] Measure vote transaction time
- [ ] Compare with BSCScan block times

### Data Refresh
- [ ] Make a transaction
- [ ] Verify data refreshes automatically
- [ ] Check no manual refresh needed

## Mobile Tests (if applicable)

### MetaMask Mobile
- [ ] Open app in mobile browser
- [ ] Connect MetaMask mobile
- [ ] Test staking on mobile
- [ ] Test voting on mobile
- [ ] Verify responsive design

## Browser Compatibility

### Chrome/Brave
- [ ] Test all features in Chrome
- [ ] Test all features in Brave

### Firefox
- [ ] Test all features in Firefox

### Safari (if on Mac)
- [ ] Test all features in Safari

## Security Tests

### Transaction Signing
- [ ] Verify all write operations require MetaMask signature
- [ ] Verify read operations don't require signature
- [ ] Verify transaction details shown in MetaMask are correct

### Contract Interaction
- [ ] Verify correct contract addresses in MetaMask
- [ ] Verify correct function calls
- [ ] Verify correct parameters passed

## Edge Cases

### Zero Balances
- [ ] Test with 0 ORX tokens
- [ ] Verify buttons disabled or show appropriate messages

### Maximum Values
- [ ] Try staking entire balance
- [ ] Verify works correctly

### Pending Transactions
- [ ] Submit transaction
- [ ] Don't confirm in MetaMask
- [ ] Verify app handles pending state
- [ ] Reject transaction
- [ ] Verify app handles rejection

## API Endpoint Tests

### Staking Endpoints
- [ ] `GET /api/staking/overview` returns data
- [ ] `GET /api/staking/info/:address` returns user data
- [ ] `GET /api/staking/validators` returns validators list

### Governance Endpoints
- [ ] `GET /api/governance/proposals` returns all proposals
- [ ] `GET /api/governance/proposals/active` returns active only
- [ ] `GET /api/governance/proposals/:id` returns specific proposal
- [ ] `GET /api/governance/voting-power/:address` returns voting power

### Dispute Endpoints
- [ ] `GET /api/disputes` returns all disputes
- [ ] `GET /api/disputes/active` returns active only
- [ ] `GET /api/disputes/:id` returns specific dispute

## Known Issues / Limitations

- [ ] Available balance shows 0 (needs ORX token contract integration)
- [ ] Cannot create proposals without 10,000 ORX
- [ ] Cannot vote without staked tokens
- [ ] Lock periods are enforced (cannot unstake early)
- [ ] One vote per address per proposal/dispute

## Post-Test Actions

After completing tests:
- [ ] Document any bugs found
- [ ] Note performance issues
- [ ] List UX improvements needed
- [ ] Suggest new features
- [ ] Update this checklist with new test cases

## Test Results Summary

**Date**: _________________
**Tester**: _________________
**Browser**: _________________
**Wallet**: _________________

**Passed Tests**: _____ / _____
**Failed Tests**: _____ / _____
**Blocked Tests**: _____ / _____

**Critical Issues Found**:
1. _________________
2. _________________

**Notes**:
_________________
_________________
