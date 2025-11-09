"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stakingService = void 0;
const ethers_1 = require("ethers");
const StakingContract_json_1 = __importDefault(require("../abis/StakingContract.json"));
const STAKING_CONTRACT_ADDRESS = process.env.STAKING_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.BSC_TESTNET_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com';
class StakingService {
    constructor() {
        this.provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL);
        this.contract = new ethers_1.ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingContract_json_1.default.abi, this.provider);
    }
    async getStakeInfo(userAddress) {
        try {
            const stakeInfo = await this.contract.getStakeInfo(userAddress);
            return {
                amount: ethers_1.ethers.formatEther(stakeInfo.amount),
                timestamp: Number(stakeInfo.timestamp),
                lockPeriod: Number(stakeInfo.lockPeriod),
                rewardDebt: ethers_1.ethers.formatEther(stakeInfo.rewardDebt),
                isValidator: stakeInfo.isValidator,
            };
        }
        catch (error) {
            console.error('Error fetching stake info:', error);
            throw error;
        }
    }
    async getPendingRewards(userAddress) {
        try {
            const earned = await this.contract.earned(userAddress);
            return ethers_1.ethers.formatEther(earned);
        }
        catch (error) {
            console.error('Error fetching pending rewards:', error);
            throw error;
        }
    }
    async getTotalStaked() {
        try {
            const totalStaked = await this.contract.totalStaked();
            return ethers_1.ethers.formatEther(totalStaked);
        }
        catch (error) {
            console.error('Error fetching total staked:', error);
            throw error;
        }
    }
    async getCurrentAPY() {
        try {
            const rewardRate = await this.contract.rewardRate();
            const totalStaked = await this.contract.totalStaked();
            if (totalStaked === 0n) {
                return '0';
            }
            const apy = (rewardRate * 31536000n * 100n) / totalStaked;
            return ethers_1.ethers.formatUnits(apy, 18);
        }
        catch (error) {
            console.error('Error calculating APY:', error);
            throw error;
        }
    }
    async getValidatorInfo(validatorAddress) {
        try {
            const validatorInfo = await this.contract.getValidatorInfo(validatorAddress);
            return {
                validatorAddress: validatorInfo.validatorAddress,
                totalStaked: ethers_1.ethers.formatEther(validatorInfo.totalStaked),
                reputation: Number(validatorInfo.reputation),
                successfulResolutions: Number(validatorInfo.successfulResolutions),
                totalResolutions: Number(validatorInfo.totalResolutions),
                isActive: validatorInfo.isActive,
                slashCount: Number(validatorInfo.slashCount),
            };
        }
        catch (error) {
            console.error('Error fetching validator info:', error);
            throw error;
        }
    }
    async getActiveValidators() {
        try {
            const validators = await this.contract.getActiveValidators();
            return validators;
        }
        catch (error) {
            console.error('Error fetching active validators:', error);
            throw error;
        }
    }
    async isActiveValidator(address) {
        try {
            return await this.contract.isActiveValidator(address);
        }
        catch (error) {
            console.error('Error checking validator status:', error);
            throw error;
        }
    }
    getContractAddress() {
        return STAKING_CONTRACT_ADDRESS;
    }
}
exports.stakingService = new StakingService();
exports.default = exports.stakingService;
//# sourceMappingURL=stakingService.js.map