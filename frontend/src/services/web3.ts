import { ethers } from 'ethers';
import { getMetaMaskProvider } from '@/utils/walletDetection';

declare global {
  interface Window {
    ethereum?: any;
  }
}

class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private orxTokenContract: ethers.Contract | null = null;
  private oracleBridgeContract: ethers.Contract | null = null;

  // Contract addresses (will be set from environment)
  private readonly ORX_TOKEN_ADDRESS = import.meta.env.VITE_ORX_TOKEN_ADDRESS || '0x7eE4f73bab260C11c68e5560c46E3975E824ed79';
  private readonly ORACLE_BRIDGE_ADDRESS = import.meta.env.VITE_ORACLE_BRIDGE_ADDRESS || '0x7CeE510d9080379738B3D9870C4C046d9a891E7F';
  private readonly AI_ORACLE_ADDRESS = import.meta.env.VITE_AI_ORACLE_ADDRESS || '0xC7FBa4a30396CC6F7fD107c165eA29E4bc62314d';
  private readonly MARKET_FACTORY_ADDRESS = import.meta.env.VITE_MARKET_FACTORY_ADDRESS || '0x273C8Dde70897069BeC84394e235feF17e7c5E1b';
  private readonly STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT_ADDRESS || '0x007Aaa957829ea04e130809e9cebbBd4d06dABa2';
  private readonly DISPUTE_RESOLUTION_ADDRESS = import.meta.env.VITE_DISPUTE_RESOLUTION_ADDRESS || '0x5fd54e5e037939C93fAC248E39459b168d741502';

  // Contract ABIs
  private readonly ORX_TOKEN_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];

  private readonly ORACLE_BRIDGE_ABI = [
    "function createMarket(string memory title, string memory description, string[] memory outcomes, uint256 endTime) returns (uint256)",
    "function placeBet(uint256 marketId, uint256 outcomeIndex) payable returns (bool)",
    "function claimReward(uint256 marketId) returns (bool)",
    "function getMarket(uint256 marketId) view returns (tuple(string title, string description, string[] outcomes, uint256 endTime, bool resolved, string result))",
    "function getUserBets(uint256 marketId, address user) view returns (uint256[] memory amounts)"
  ];

  /**
   * Initialize Web3 connection
   */
  async initialize(): Promise<boolean> {
    // Get MetaMask provider specifically
    const metaMaskProvider = getMetaMaskProvider();
    if (!metaMaskProvider) {
      throw new Error('MetaMask is not installed');
    }

    try {
      this.provider = new ethers.BrowserProvider(metaMaskProvider);
      return true;
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
      return false;
    }
  }

  /**
   * Connect wallet
   */
  async connectWallet(): Promise<string> {
    if (!this.provider) {
      await this.initialize();
    }

    try {
      // Get MetaMask provider specifically
      const metaMaskProvider = getMetaMaskProvider();
      if (!metaMaskProvider) {
        throw new Error('MetaMask not found');
      }

      await metaMaskProvider.request({ method: 'eth_requestAccounts' });
      this.signer = await this.provider!.getSigner();
      
      const address = await this.signer.getAddress();
      await this.initializeContracts();
      
      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw new Error('Failed to connect wallet');
    }
  }

  /**
   * Initialize contracts
   */
  private async initializeContracts() {
    if (!this.signer) return;

    try {
      if (this.ORX_TOKEN_ADDRESS) {
        this.orxTokenContract = new ethers.Contract(
          this.ORX_TOKEN_ADDRESS,
          this.ORX_TOKEN_ABI,
          this.signer
        );
      }

      if (this.ORACLE_BRIDGE_ADDRESS) {
        this.oracleBridgeContract = new ethers.Contract(
          this.ORACLE_BRIDGE_ADDRESS,
          this.ORACLE_BRIDGE_ABI,
          this.signer
        );
      }
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
    }
  }

  /**
   * Switch to BNB Smart Chain
   */
  async switchToBNBChain(): Promise<boolean> {
    try {
      // Get MetaMask provider specifically
      const metaMaskProvider = getMetaMaskProvider();
      if (!metaMaskProvider) {
        throw new Error('MetaMask not found');
      }

      const chainId = import.meta.env.VITE_CHAIN_ID || '0x61'; // BSC Testnet
      
      await metaMaskProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      
      return true;
    } catch (switchError: any) {
      // Chain not added to MetaMask
      if (switchError.code === 4902) {
        try {
          const metaMaskProvider = getMetaMaskProvider();
          if (!metaMaskProvider) {
            throw new Error('MetaMask not found');
          }
          
          await metaMaskProvider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: import.meta.env.VITE_CHAIN_ID || '0x61',
                chainName: import.meta.env.VITE_CHAIN_NAME || 'BNB Smart Chain Testnet',
                rpcUrls: [import.meta.env.VITE_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545'],
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://testnet.bscscan.com'],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add BNB chain:', addError);
          return false;
        }
      }
      console.error('Failed to switch to BNB chain:', switchError);
      return false;
    }
  }

  /**
   * Get current connected account
   */
  async getCurrentAccount(): Promise<string | null> {
    if (!this.provider) return null;

    try {
      const metaMaskProvider = getMetaMaskProvider();
      if (!metaMaskProvider) {
        return null;
      }
      
      const accounts = await metaMaskProvider.request({ method: 'eth_accounts' });
      return accounts[0] || null;
    } catch (error) {
      console.error('Failed to get current account:', error);
      return null;
    }
  }

  /**
   * Get account balance (BNB)
   */
  async getBalance(address?: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');

    const account = address || await this.getCurrentAccount();
    if (!account) throw new Error('No account connected');

    const balance = await this.provider.getBalance(account);
    return ethers.formatEther(balance);
  }

  /**
   * Get ORX token balance
   */
  async getORXBalance(address?: string): Promise<string> {
    if (!this.orxTokenContract) throw new Error('ORX Token contract not available');

    const account = address || await this.getCurrentAccount();
    if (!account) throw new Error('No account connected');

    const balance = await this.orxTokenContract.balanceOf(account);
    return ethers.formatEther(balance);
  }

  /**
   * Create a new market
   */
  async createMarket(
    title: string,
    description: string,
    outcomes: string[],
    endTime: number
  ): Promise<{ txHash: string; marketId?: number }> {
    if (!this.oracleBridgeContract) {
      throw new Error('Oracle Bridge contract not available');
    }

    try {
      const tx = await this.oracleBridgeContract.createMarket(
        title,
        description,
        outcomes,
        endTime
      );

      const receipt = await tx.wait();
      
      // Try to extract market ID from events
      let marketId;
      try {
        const event = receipt.logs.find((log: any) => 
          log.fragment && log.fragment.name === 'MarketCreated'
        );
        marketId = event ? Number(event.args[0]) : undefined;
      } catch (e) {
        console.warn('Could not extract market ID from events');
      }

      return {
        txHash: receipt.hash,
        marketId
      };
    } catch (error) {
      console.error('Failed to create market:', error);
      throw new Error('Failed to create market');
    }
  }

  /**
   * Place a bet on a market
   */
  async placeBet(
    marketId: number,
    outcomeIndex: number,
    amount: string
  ): Promise<string> {
    if (!this.oracleBridgeContract) {
      throw new Error('Oracle Bridge contract not available');
    }

    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await this.oracleBridgeContract.placeBet(
        marketId,
        outcomeIndex,
        { value: amountWei }
      );

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Failed to place bet:', error);
      throw new Error('Failed to place bet');
    }
  }

  /**
   * Claim rewards from a market
   */
  async claimReward(marketId: number): Promise<string> {
    if (!this.oracleBridgeContract) {
      throw new Error('Oracle Bridge contract not available');
    }

    try {
      const tx = await this.oracleBridgeContract.claimReward(marketId);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Failed to claim reward:', error);
      throw new Error('Failed to claim reward');
    }
  }

  /**
   * Get market data from blockchain
   */
  async getMarketData(marketId: number) {
    if (!this.oracleBridgeContract) {
      throw new Error('Oracle Bridge contract not available');
    }

    try {
      return await this.oracleBridgeContract.getMarket(marketId);
    } catch (error) {
      console.error('Failed to get market data:', error);
      throw new Error('Failed to get market data');
    }
  }

  /**
   * Get user bets for a market
   */
  async getUserBets(marketId: number, address?: string): Promise<string[]> {
    if (!this.oracleBridgeContract) {
      throw new Error('Oracle Bridge contract not available');
    }

    const account = address || await this.getCurrentAccount();
    if (!account) throw new Error('No account connected');

    try {
      const bets = await this.oracleBridgeContract.getUserBets(marketId, account);
      return bets.map((bet: any) => ethers.formatEther(bet));
    } catch (error) {
      console.error('Failed to get user bets:', error);
      throw new Error('Failed to get user bets');
    }
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(contractMethod: any, params: any[]): Promise<string> {
    try {
      const gasEstimate = await contractMethod.estimateGas(...params);
      return gasEstimate.toString();
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      return '100000'; // Fallback
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');

    const feeData = await this.provider.getFeeData();
    return ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
  }

  /**
   * Listen to contract events
   */
  subscribeToEvents(callback: (event: any) => void) {
    if (!this.oracleBridgeContract) return;

    this.oracleBridgeContract.on('MarketCreated', (...args) => {
      callback({ type: 'MarketCreated', data: args });
    });

    this.oracleBridgeContract.on('BetPlaced', (...args) => {
      callback({ type: 'BetPlaced', data: args });
    });

    this.oracleBridgeContract.on('MarketResolved', (...args) => {
      callback({ type: 'MarketResolved', data: args });
    });
  }

  /**
   * Disconnect wallet
   */
  async disconnect() {
    this.provider = null;
    this.signer = null;
    this.orxTokenContract = null;
    this.oracleBridgeContract = null;
  }
}

export const web3Service = new Web3Service();
export { Web3Service };