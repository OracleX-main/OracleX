import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { BlockchainConfig } from '../types';

export class BlockchainClient extends EventEmitter {
  private web3: Web3;
  private config: BlockchainConfig;
  private contracts: Map<string, Contract<any>> = new Map();

  constructor(config: BlockchainConfig) {
    super();
    this.config = config;
    this.web3 = new Web3(config.providerUrl);
    
    // Set default account if provided
    if (config.privateKey) {
      const account = this.web3.eth.accounts.privateKeyToAccount(config.privateKey);
      this.web3.eth.accounts.wallet.add(account);
      this.web3.eth.defaultAccount = account.address;
    }
  }

  async initialize(): Promise<void> {
    try {
      // Test connection
      const blockNumber = await this.web3.eth.getBlockNumber();
      logger.info(`Connected to blockchain at block ${blockNumber}`);

      // Load contracts
      await this.loadContracts();
    } catch (error) {
      logger.error('Failed to initialize blockchain client:', error);
      throw error;
    }
  }

  async connect(): Promise<void> {
    await this.initialize();
  }

  private async loadContracts(): Promise<void> {
    try {
      // TODO: Load actual contract ABIs and addresses
      const contractConfigs = [
        {
          name: 'ORXToken',
          address: this.config.contractAddress || '0x0000000000000000000000000000000000000000',
          abi: [] // TODO: Load actual ABI
        },
        {
          name: 'OracleBridge',
          address: this.config.contractAddress || '0x0000000000000000000000000000000000000000',
          abi: [] // TODO: Load actual ABI
        }
      ];

      for (const contractConfig of contractConfigs) {
        if (contractConfig.address !== '0x0000000000000000000000000000000000000000') {
          const contract = new this.web3.eth.Contract(contractConfig.abi, contractConfig.address);
          this.contracts.set(contractConfig.name, contract);
          logger.info(`Loaded contract ${contractConfig.name} at ${contractConfig.address}`);
        }
      }
    } catch (error) {
      logger.error('Failed to load contracts:', error);
    }
  }

  getContract(name: string): Contract<any> | undefined {
    return this.contracts.get(name);
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.web3.eth.getBalance(address);
    return this.web3.utils.fromWei(balance, 'ether');
  }

  async getCurrentBlock(): Promise<number> {
    const blockNumber = await this.web3.eth.getBlockNumber();
    return Number(blockNumber);
  }

  async sendTransaction(to: string, data: string, value?: string): Promise<string> {
    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      const gasEstimate = await this.web3.eth.estimateGas({
        to,
        data,
        value: value ? this.web3.utils.toWei(value, 'ether') : '0'
      });

      const tx = {
        to,
        data,
        gas: gasEstimate.toString(),
        gasPrice: gasPrice.toString(),
        value: value ? this.web3.utils.toWei(value, 'ether') : '0'
      };

      const signedTx = await this.web3.eth.accounts.signTransaction(tx, this.config.privateKey!);
      const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction!);
      
      logger.info(`Transaction sent: ${receipt.transactionHash}`);
      return receipt.transactionHash.toString();
    } catch (error) {
      logger.error('Failed to send transaction:', error);
      throw error;
    }
  }

  async callContractMethod(contractName: string, methodName: string, params: any[] = []): Promise<any> {
    const contract = this.getContract(contractName);
    if (!contract) {
      throw new Error(`Contract ${contractName} not found`);
    }

    try {
      const result = await contract.methods[methodName](...params).call();
      return result;
    } catch (error) {
      logger.error(`Failed to call ${contractName}.${methodName}:`, error);
      throw error;
    }
  }

  async sendContractTransaction(contractName: string, methodName: string, params: any[] = []): Promise<string> {
    const contract = this.getContract(contractName);
    if (!contract) {
      throw new Error(`Contract ${contractName} not found`);
    }

    try {
      const method = contract.methods[methodName](...params);
      const gasEstimate = await method.estimateGas({ from: this.web3.eth.defaultAccount });
      const gasPrice = await this.web3.eth.getGasPrice();

      const receipt = await method.send({
        from: this.web3.eth.defaultAccount,
        gas: gasEstimate.toString(),
        gasPrice: gasPrice.toString()
      });

      logger.info(`Contract transaction sent: ${receipt.transactionHash}`);
      return receipt.transactionHash.toString();
    } catch (error) {
      logger.error(`Failed to send contract transaction ${contractName}.${methodName}:`, error);
      throw error;
    }
  }

  async listenToEvents(contractName: string, eventName: string, callback: (event: any) => void): Promise<void> {
    const contract = this.getContract(contractName);
    if (!contract) {
      throw new Error(`Contract ${contractName} not found`);
    }

    try {
      // Subscribe to events
      const subscription = await contract.events[eventName]({
        fromBlock: 'latest'
      });

      subscription.on('data', callback);
      subscription.on('error', (error: Error) => {
        logger.error(`Error listening to ${contractName}.${eventName}:`, error);
      });

      logger.info(`Started listening to ${contractName}.${eventName} events`);
    } catch (error) {
      logger.error(`Failed to setup event listener for ${contractName}.${eventName}:`, error);
      throw error;
    }
  }

  disconnect(): void {
    // Clean up connections
    this.contracts.clear();
    logger.info('Blockchain client disconnected');
  }

  // Additional methods for Oracle functionality
  async getMarket(marketId: string): Promise<any> {
    // TODO: Implement actual market fetching from blockchain
    return {
      id: marketId,
      question: 'Mock Market Question',
      category: 'general',
      outcomes: ['YES', 'NO'],
      deadline: new Date(Date.now() + 86400000), // 24 hours from now
      createdAt: new Date(),
      creator: 'mock_creator',
      totalStake: 0,
      status: 'ACTIVE'
    };
  }

  async submitResolution(oracleResult: any): Promise<string> {
    // TODO: Implement actual resolution submission
    logger.info('Submitting resolution to blockchain:', oracleResult);
    return '0x1234567890abcdef1234567890abcdef12345678';
  }

  async submitDisputeResolution(marketId: string, resolution: any): Promise<string> {
    // TODO: Implement actual dispute resolution submission
    logger.info(`Submitting dispute resolution for market ${marketId}:`, resolution);
    return '0x1234567890abcdef1234567890abcdef12345678';
  }

  async getStatus(): Promise<any> {
    try {
      const blockNumber = await this.getCurrentBlock();
      const gasPrice = await this.web3.eth.getGasPrice();
      const defaultAccount = this.web3.eth.defaultAccount;
      const balance = defaultAccount ? await this.getBalance(defaultAccount) : '0';

      return {
        connected: true,
        networkName: 'BNB Smart Chain',
        latestBlock: blockNumber,
        gasPrice: gasPrice.toString(),
        balance
      };
    } catch (error) {
      return {
        connected: false,
        networkName: 'Unknown',
        latestBlock: 0,
        gasPrice: '0',
        balance: '0'
      };
    }
  }
}