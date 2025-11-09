# Smart Contract Reference

Complete documentation for all OracleX smart contracts deployed on BNB Chain Testnet.

## 📋 Contract Overview

| Contract | Address | Purpose |
|----------|---------|---------|
| **ORX Token** | `0x7eE4f73bab260C11c68e5560c46E3975E824ed79` | ERC-20 utility token |
| **Market Factory** | `0x273C8Dde70897069BeC84394e235feF17e7c5E1b` | Creates prediction markets |
| **Staking Contract** | `0x007Aaa957829ea04e130809e9cebbBd4d06dABa2` | Token staking & rewards |
| **Governance DAO** | `0x0b88B36631911efeBe9Dd6395Fb6DA635B1EfF8F` | Decentralized governance |
| **Dispute Resolution** | `0x5fd54e5e037939C93fAC248E39459b168d741502` | Resolves outcome disputes |
| **Oracle Bridge** | `0x7CeE510d9080379738B3D9870C4C046d9a891E7F` | Connects oracles to markets |
| **AI Oracle** | `0xC7FBa4a30396CC6F7fD107c165eA29E4bc62314d` | AI-powered oracle |

## Network Information

**Network**: BNB Smart Chain Testnet  
**Chain ID**: 97  
**RPC URL**: `https://bsc-testnet-rpc.publicnode.com`  
**Explorer**: https://testnet.bscscan.com  
**Faucet**: https://testnet.bnbchain.org/faucet-smart  

## Quick Links

- [ORX Token →](orx-token.md)
- [Market Factory →](market-factory.md)
- [Staking Contract →](staking-contract.md)
- [Governance DAO →](governance-dao.md)
- [Full API Reference →](../../reference/api-reference.md)

## Development Resources

### Web3 Connection

```typescript
import { ethers } from 'ethers';

// Connect to BNB Testnet
const provider = new ethers.JsonRpcProvider(
  'https://bsc-testnet-rpc.publicnode.com'
);

// Connect wallet
const signer = await provider.getSigner();

// Initialize contract
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  signer
);
```

### ABIs

All contract ABIs are available in:
- **Frontend**: `/frontend/src/abis/`
- **Contracts**: `/contracts/deployments/bsc-testnet/`

## Contract Interactions

### Common Patterns

#### Reading Data
```typescript
// Read-only calls (no gas)
const balance = await tokenContract.balanceOf(address);
const market = await factoryContract.markets(marketId);
```

#### Writing Data
```typescript
// State-changing transactions (requires gas)
const tx = await contract.functionName(params, {
  gasLimit: 300000
});
const receipt = await tx.wait();
console.log('Transaction hash:', tx.hash);
```

#### Handling Events
```typescript
// Listen for events
contract.on('EventName', (param1, param2, event) => {
  console.log('Event triggered:', param1, param2);
});

// Query past events
const events = await contract.queryFilter(
  contract.filters.EventName(),
  fromBlock,
  toBlock
);
```

## Gas Optimization Tips

1. **Batch Operations**: Combine multiple calls when possible
2. **Approve Once**: Set max approval to avoid repeated approvals
3. **Use Multicall**: Query multiple contracts in one call
4. **Event Indexing**: Use indexed parameters for efficient filtering
5. **Storage Packing**: Related variables in same storage slot

## Security Considerations

- ✅ Always verify contract addresses
- ✅ Check allowance before approving
- ✅ Validate transaction parameters
- ✅ Test on testnet first
- ✅ Use hardware wallet for large amounts
- ⚠️ Never share private keys
- ⚠️ Beware of phishing attempts
- ⚠️ Double-check recipient addresses

## Upgradeability

OracleX contracts use different upgrade patterns:

| Contract | Pattern | Rationale |
|----------|---------|-----------|
| ORX Token | **Immutable** | ERC-20 standard, no upgrade needed |
| Market Factory | **Proxy (UUPS)** | Can add features, fix bugs |
| Staking | **Proxy (UUPS)** | Can adjust reward mechanics |
| Governance | **Immutable** | Trust in governance rules |
| Dispute | **Proxy (UUPS)** | May need to adjust dispute logic |

## Testing

```bash
# Run contract tests
cd contracts
npm test

# Run specific test file
npx hardhat test test/ORXToken.test.ts

# Coverage report
npx hardhat coverage

# Gas reporter
REPORT_GAS=true npx hardhat test
```

## Deployment

```bash
# Deploy to testnet
npm run deploy:testnet

# Verify contracts
npm run verify:testnet

# Update frontend ABIs
npm run copy-abis
```

## See Also

- [Token Economics →](../../tokenomics/orx-token.md)
- [API Reference →](../../reference/api-reference.md)
- [Security Audits →](../../security/audits.md)

---

<div style="background: linear-gradient(135deg, #FFD700, #9333EA); padding: 1.5rem; border-radius: 12px; color: white;">
  <strong>📖 Dive Deeper:</strong> Explore individual contract documentation for detailed function signatures, events, and usage examples.
</div>
