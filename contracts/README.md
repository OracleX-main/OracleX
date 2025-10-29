# Smart Contracts

Solidity smart contracts for OracleX prediction markets on BNB Chain.

## Contracts

- `MarketFactory.sol` - Creates and manages prediction markets
- `Market.sol` - Individual market logic and outcome resolution  
- `OracleBridge.sol` - Connects AI oracles to on-chain data
- `ORXToken.sol` - Native utility and governance token
- `Staking.sol` - Validator staking and reward distribution
- `Governance.sol` - DAO governance and proposal system

## Development

```bash
npm install
npx hardhat compile
npx hardhat test
npx hardhat deploy --network bsc-testnet
```

## Testing

```bash
npx hardhat test
npx hardhat coverage
```

## Deployment

```bash
# Deploy to BSC Testnet
npx hardhat deploy --network bsc-testnet

# Deploy to BSC Mainnet
npx hardhat deploy --network bsc-mainnet
```