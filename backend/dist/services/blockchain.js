"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = exports.blockchainService = void 0;
const ethers_1 = require("ethers");
const config_1 = require("../config");
class BlockchainService {
    constructor() {
        this.ORX_TOKEN_ABI = [
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
        this.ORACLE_BRIDGE_ABI = [
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
        this.provider = new ethers_1.ethers.JsonRpcProvider(config_1.config.BLOCKCHAIN_RPC_URL);
        if (config_1.config.PRIVATE_KEY) {
            this.wallet = new ethers_1.ethers.Wallet(config_1.config.PRIVATE_KEY, this.provider);
        }
        this.initializeContracts();
    }
    initializeContracts() {
        try {
            if (config_1.config.ORX_TOKEN_ADDRESS) {
                this.orxTokenContract = new ethers_1.ethers.Contract(config_1.config.ORX_TOKEN_ADDRESS, this.ORX_TOKEN_ABI, this.wallet || this.provider);
            }
            if (config_1.config.ORACLE_BRIDGE_ADDRESS) {
                this.oracleBridgeContract = new ethers_1.ethers.Contract(config_1.config.ORACLE_BRIDGE_ADDRESS, this.ORACLE_BRIDGE_ABI, this.wallet || this.provider);
            }
            console.log('✅ Blockchain contracts initialized');
        }
        catch (error) {
            console.error('❌ Error initializing contracts:', error);
        }
    }
    async getCurrentBlockNumber() {
        return await this.provider.getBlockNumber();
    }
    async getNetworkInfo() {
        const network = await this.provider.getNetwork();
        return {
            chainId: Number(network.chainId),
            name: network.name
        };
    }
    async getBalance(address) {
        const balance = await this.provider.getBalance(address);
        return ethers_1.ethers.formatEther(balance);
    }
    async getORXBalance(address) {
        if (!this.orxTokenContract) {
            throw new Error('ORX Token contract not initialized');
        }
        const balance = await this.orxTokenContract.balanceOf(address);
        return ethers_1.ethers.formatEther(balance);
    }
    async createMarket(title, description, outcomes, endTime) {
        if (!this.oracleBridgeContract || !this.wallet) {
            throw new Error('Oracle Bridge contract or wallet not initialized');
        }
        const tx = await this.oracleBridgeContract.createMarket(title, description, outcomes, endTime);
        const receipt = await tx.wait();
        const event = receipt.logs.find((log) => log.fragment && log.fragment.name === 'MarketCreated');
        const marketId = event ? event.args[0] : 0;
        return {
            txHash: receipt.hash,
            marketId: Number(marketId)
        };
    }
    async placeBet(marketId, outcomeIndex, amount) {
        if (!this.oracleBridgeContract || !this.wallet) {
            throw new Error('Oracle Bridge contract or wallet not initialized');
        }
        const amountWei = ethers_1.ethers.parseEther(amount);
        const tx = await this.oracleBridgeContract.placeBet(marketId, outcomeIndex, amountWei);
        const receipt = await tx.wait();
        return receipt.hash;
    }
    async resolveMarket(marketId, outcome) {
        if (!this.oracleBridgeContract || !this.wallet) {
            throw new Error('Oracle Bridge contract or wallet not initialized');
        }
        const tx = await this.oracleBridgeContract.resolveMarket(marketId, outcome);
        const receipt = await tx.wait();
        return receipt.hash;
    }
    async claimReward(marketId) {
        if (!this.oracleBridgeContract || !this.wallet) {
            throw new Error('Oracle Bridge contract or wallet not initialized');
        }
        const tx = await this.oracleBridgeContract.claimReward(marketId);
        const receipt = await tx.wait();
        return receipt.hash;
    }
    async getMarketFromChain(marketId) {
        if (!this.oracleBridgeContract) {
            throw new Error('Oracle Bridge contract not initialized');
        }
        return await this.oracleBridgeContract.getMarket(marketId);
    }
    subscribeToMarketEvents(callback) {
        if (!this.oracleBridgeContract) {
            throw new Error('Oracle Bridge contract not initialized');
        }
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
    async estimateGas(contractMethod, params) {
        const gasPrice = await this.provider.getFeeData();
        return {
            gasLimit: "100000",
            gasPrice: gasPrice.gasPrice ? ethers_1.ethers.formatUnits(gasPrice.gasPrice, 'gwei') : "10"
        };
    }
    async getTransactionReceipt(txHash) {
        return await this.provider.getTransactionReceipt(txHash);
    }
    async waitForTransaction(txHash, confirmations = 1) {
        return await this.provider.waitForTransaction(txHash, confirmations);
    }
    async isContractDeployed(address) {
        const code = await this.provider.getCode(address);
        return code !== '0x';
    }
    async getGasPrice() {
        const feeData = await this.provider.getFeeData();
        return ethers_1.ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
    }
}
exports.BlockchainService = BlockchainService;
exports.blockchainService = new BlockchainService();
//# sourceMappingURL=blockchain.js.map