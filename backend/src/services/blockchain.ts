import { ethers } from 'ethers';
import { config } from '../config';

class BlockchainService {
  private provider: ethers.Provider;
  private wallet?: ethers.Wallet;
  private orxTokenContract?: ethers.Contract;
  private oracleBridgeContract?: ethers.Contract;

  // Contract ABIs (would be imported from compiled contracts)
  private readonly ORX_TOKEN_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
  ];

  private readonly ORACLE_BRIDGE_ABI = [
    "function createMarket(string memory title, string memory description, string[] memory outcomes, uint256 endTime) returns (uint256)",
    "function resolveMarket(uint256 marketId, string memory outcome) returns (bool)",
    "function placeBet(uint256 marketId, uint256 outcomeIndex, uint256 amount) returns (bool)",
    "function claimReward(uint256 marketId) returns (bool)",
    "function getMarket(uint256 marketId) view returns (tuple(string title, string description, string[] outcomes, uint256 endTime, bool resolved, string result))",
    "function getMarketBets(uint256 marketId, address user) view returns (uint256[] memory amounts)",
    "event MarketCreated(uint256 indexed marketId, string title, address creator)",
    "event BetPlaced(uint256 indexed marketId, address indexed user, uint256 outcomeIndex, uint256 amount)",
    "event MarketResolved(uint256 indexed marketId, string outcome)",
    "event RewardClaimed(uint256 indexed marketId, address indexed user, uint256 amount)"
  ];

  constructor() {
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(config.BLOCKCHAIN_RPC_URL);
    
    // Initialize wallet if private key is provided
    if (config.PRIVATE_KEY) {
      this.wallet = new ethers.Wallet(config.PRIVATE_KEY, this.provider);
    }

    this.initializeContracts();
  }

  private initializeContracts() {
    try {
      // Initialize ORX Token contract
      if (config.ORX_TOKEN_ADDRESS) {
        this.orxTokenContract = new ethers.Contract(
          config.ORX_TOKEN_ADDRESS,
          this.ORX_TOKEN_ABI,
          this.wallet || this.provider
        );
      }

      // Initialize Oracle Bridge contract
      if (config.ORACLE_BRIDGE_ADDRESS) {
        this.oracleBridgeContract = new ethers.Contract(
          config.ORACLE_BRIDGE_ADDRESS, 
          this.ORACLE_BRIDGE_ABI,
          this.wallet || this.provider
        );
      }

      console.log('✅ Blockchain contracts initialized');
    } catch (error) {
      console.error('❌ Error initializing contracts:', error);
    }
  }

  /**
   * Get current block number
   */
  async getCurrentBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  /**
   * Get network information
   */
  async getNetworkInfo(): Promise<{ chainId: number; name: string }> {
    const network = await this.provider.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name
    };
  }

  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  /**
   * Get ORX token balance
   */
  async getORXBalance(address: string): Promise<string> {
    if (!this.orxTokenContract) {
      throw new Error('ORX Token contract not initialized');
    }

    const balance = await this.orxTokenContract.balanceOf(address);
    return ethers.formatEther(balance);
  }

  /**
   * Create a new prediction market
   */
  async createMarket(
    title: string,
    description: string,
    outcomes: string[],
    endTime: number
  ): Promise<{ txHash: string; marketId: number }> {
    if (!this.oracleBridgeContract || !this.wallet) {
      throw new Error('Oracle Bridge contract or wallet not initialized');
    }

    const tx = await this.oracleBridgeContract.createMarket(
      title,
      description,
      outcomes,
      endTime
    );

    const receipt = await tx.wait();
    
    // Extract market ID from events
    const event = receipt.logs.find((log: any) => 
      log.fragment && log.fragment.name === 'MarketCreated'
    );
    const marketId = event ? event.args[0] : 0;

    return {
      txHash: receipt.hash,
      marketId: Number(marketId)
    };
  }

  /**
   * Place a bet on a market
   */
  async placeBet(
    marketId: number,
    outcomeIndex: number,
    amount: string
  ): Promise<string> {
    if (!this.oracleBridgeContract || !this.wallet) {
      throw new Error('Oracle Bridge contract or wallet not initialized');
    }

    const amountWei = ethers.parseEther(amount);
    const tx = await this.oracleBridgeContract.placeBet(
      marketId,
      outcomeIndex,
      amountWei
    );

    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Resolve a market (oracle only)
   */
  async resolveMarket(marketId: number, outcome: string): Promise<string> {
    if (!this.oracleBridgeContract || !this.wallet) {
      throw new Error('Oracle Bridge contract or wallet not initialized');
    }

    const tx = await this.oracleBridgeContract.resolveMarket(marketId, outcome);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Claim rewards from a resolved market
   */
  async claimReward(marketId: number): Promise<string> {
    if (!this.oracleBridgeContract || !this.wallet) {
      throw new Error('Oracle Bridge contract or wallet not initialized');
    }

    const tx = await this.oracleBridgeContract.claimReward(marketId);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Get market details from blockchain
   */
  async getMarketFromChain(marketId: number): Promise<any> {
    if (!this.oracleBridgeContract) {
      throw new Error('Oracle Bridge contract not initialized');
    }

    return await this.oracleBridgeContract.getMarket(marketId);
  }

  /**
   * Listen to blockchain events
   */
  subscribeToMarketEvents(callback: (event: any) => void) {
    if (!this.oracleBridgeContract) {
      throw new Error('Oracle Bridge contract not initialized');
    }

    // Listen to all market-related events
    this.oracleBridgeContract.on('MarketCreated', (...args) => {
      callback({ type: 'MarketCreated', data: args });
    });

    this.oracleBridgeContract.on('BetPlaced', (...args) => {
      callback({ type: 'BetPlaced', data: args });
    });

    this.oracleBridgeContract.on('MarketResolved', (...args) => {
      callback({ type: 'MarketResolved', data: args });
    });

    this.oracleBridgeContract.on('RewardClaimed', (...args) => {
      callback({ type: 'RewardClaimed', data: args });
    });
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(
    contractMethod: string,
    params: any[]
  ): Promise<{ gasLimit: string; gasPrice: string }> {
    const gasPrice = await this.provider.getFeeData();
    
    return {
      gasLimit: "100000", // Default estimate
      gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : "10"
    };
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string) {
    return await this.provider.getTransactionReceipt(txHash);
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash: string, confirmations = 1) {
    return await this.provider.waitForTransaction(txHash, confirmations);
  }

  /**
   * Check if contract is deployed
   */
  async isContractDeployed(address: string): Promise<boolean> {
    const code = await this.provider.getCode(address);
    return code !== '0x';
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<string> {
    const feeData = await this.provider.getFeeData();
    return ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
  }
}

export const blockchainService = new BlockchainService();
export { BlockchainService };