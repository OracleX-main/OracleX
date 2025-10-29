"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainClient = void 0;
const web3_1 = __importDefault(require("web3"));
const events_1 = require("events");
const logger_1 = require("../utils/logger");
class BlockchainClient extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.contracts = new Map();
        this.config = config;
        this.web3 = new web3_1.default(config.providerUrl);
        if (config.privateKey) {
            const account = this.web3.eth.accounts.privateKeyToAccount(config.privateKey);
            this.web3.eth.accounts.wallet.add(account);
            this.web3.eth.defaultAccount = account.address;
        }
    }
    async initialize() {
        try {
            const blockNumber = await this.web3.eth.getBlockNumber();
            logger_1.logger.info(`Connected to blockchain at block ${blockNumber}`);
            await this.loadContracts();
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize blockchain client:', error);
            throw error;
        }
    }
    async connect() {
        await this.initialize();
    }
    async loadContracts() {
        try {
            const contractConfigs = [
                {
                    name: 'ORXToken',
                    address: this.config.contractAddress || '0x0000000000000000000000000000000000000000',
                    abi: []
                },
                {
                    name: 'OracleBridge',
                    address: this.config.contractAddress || '0x0000000000000000000000000000000000000000',
                    abi: []
                }
            ];
            for (const contractConfig of contractConfigs) {
                if (contractConfig.address !== '0x0000000000000000000000000000000000000000') {
                    const contract = new this.web3.eth.Contract(contractConfig.abi, contractConfig.address);
                    this.contracts.set(contractConfig.name, contract);
                    logger_1.logger.info(`Loaded contract ${contractConfig.name} at ${contractConfig.address}`);
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to load contracts:', error);
        }
    }
    getContract(name) {
        return this.contracts.get(name);
    }
    async getBalance(address) {
        const balance = await this.web3.eth.getBalance(address);
        return this.web3.utils.fromWei(balance, 'ether');
    }
    async getCurrentBlock() {
        const blockNumber = await this.web3.eth.getBlockNumber();
        return Number(blockNumber);
    }
    async sendTransaction(to, data, value) {
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
            const signedTx = await this.web3.eth.accounts.signTransaction(tx, this.config.privateKey);
            const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            logger_1.logger.info(`Transaction sent: ${receipt.transactionHash}`);
            return receipt.transactionHash.toString();
        }
        catch (error) {
            logger_1.logger.error('Failed to send transaction:', error);
            throw error;
        }
    }
    async callContractMethod(contractName, methodName, params = []) {
        const contract = this.getContract(contractName);
        if (!contract) {
            throw new Error(`Contract ${contractName} not found`);
        }
        try {
            const result = await contract.methods[methodName](...params).call();
            return result;
        }
        catch (error) {
            logger_1.logger.error(`Failed to call ${contractName}.${methodName}:`, error);
            throw error;
        }
    }
    async sendContractTransaction(contractName, methodName, params = []) {
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
            logger_1.logger.info(`Contract transaction sent: ${receipt.transactionHash}`);
            return receipt.transactionHash.toString();
        }
        catch (error) {
            logger_1.logger.error(`Failed to send contract transaction ${contractName}.${methodName}:`, error);
            throw error;
        }
    }
    async listenToEvents(contractName, eventName, callback) {
        const contract = this.getContract(contractName);
        if (!contract) {
            throw new Error(`Contract ${contractName} not found`);
        }
        try {
            const subscription = await contract.events[eventName]({
                fromBlock: 'latest'
            });
            subscription.on('data', callback);
            subscription.on('error', (error) => {
                logger_1.logger.error(`Error listening to ${contractName}.${eventName}:`, error);
            });
            logger_1.logger.info(`Started listening to ${contractName}.${eventName} events`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to setup event listener for ${contractName}.${eventName}:`, error);
            throw error;
        }
    }
    disconnect() {
        this.contracts.clear();
        logger_1.logger.info('Blockchain client disconnected');
    }
    async getMarket(marketId) {
        return {
            id: marketId,
            question: 'Mock Market Question',
            category: 'general',
            outcomes: ['YES', 'NO'],
            deadline: new Date(Date.now() + 86400000),
            createdAt: new Date(),
            creator: 'mock_creator',
            totalStake: 0,
            status: 'ACTIVE'
        };
    }
    async submitResolution(oracleResult) {
        logger_1.logger.info('Submitting resolution to blockchain:', oracleResult);
        return '0x1234567890abcdef1234567890abcdef12345678';
    }
    async submitDisputeResolution(marketId, resolution) {
        logger_1.logger.info(`Submitting dispute resolution for market ${marketId}:`, resolution);
        return '0x1234567890abcdef1234567890abcdef12345678';
    }
    async getStatus() {
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
        }
        catch (error) {
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
exports.BlockchainClient = BlockchainClient;
//# sourceMappingURL=client.js.map