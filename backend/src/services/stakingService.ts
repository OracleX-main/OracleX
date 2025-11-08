import { ethers } from 'ethers';
import StakingContractABI from '../abis/StakingContract.json';

const STAKING_CONTRACT_ADDRESS = process.env.STAKING_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.BSC_TESTNET_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com';

class StakingService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.contract = new ethers.Contract(
      STAKING_CONTRACT_ADDRESS,
      StakingContractABI.abi,
      this.provider
    );
  }

  /**
   * Get stake info for a user
   */
  async getStakeInfo(userAddress: string) {
    try {
      const stakeInfo = await this.contract.getStakeInfo(userAddress);
      return {
        amount: ethers.formatEther(stakeInfo.amount),
        timestamp: Number(stakeInfo.timestamp),
        lockPeriod: Number(stakeInfo.lockPeriod),
        rewardDebt: ethers.formatEther(stakeInfo.rewardDebt),
        isValidator: stakeInfo.isValidator,
      };
    } catch (error) {
      console.error('Error fetching stake info:', error);
      throw error;
    }
  }

  /**
   * Get pending rewards for a user
   */
  async getPendingRewards(userAddress: string) {
    try {
      const earned = await this.contract.earned(userAddress);
      return ethers.formatEther(earned);
    } catch (error) {
      console.error('Error fetching pending rewards:', error);
      throw error;
    }
  }

  /**
   * Get total staked amount
   */
  async getTotalStaked() {
    try {
      const totalStaked = await this.contract.totalStaked();
      return ethers.formatEther(totalStaked);
    } catch (error) {
      console.error('Error fetching total staked:', error);
      throw error;
    }
  }

  /**
   * Get current APY
   */
  async getCurrentAPY() {
    try {
      const rewardRate = await this.contract.rewardRate();
      const totalStaked = await this.contract.totalStaked();
      
      if (totalStaked === 0n) {
        return '0';
      }
      
      // APY calculation: (rewardRate * 31536000 * 100) / totalStaked
      // 31536000 = seconds in a year
      const apy = (rewardRate * 31536000n * 100n) / totalStaked;
      return ethers.formatUnits(apy, 18);
    } catch (error) {
      console.error('Error calculating APY:', error);
      throw error;
    }
  }

  /**
   * Get validator info
   */
  async getValidatorInfo(validatorAddress: string) {
    try {
      const validatorInfo = await this.contract.getValidatorInfo(validatorAddress);
      return {
        validatorAddress: validatorInfo.validatorAddress,
        totalStaked: ethers.formatEther(validatorInfo.totalStaked),
        reputation: Number(validatorInfo.reputation),
        successfulResolutions: Number(validatorInfo.successfulResolutions),
        totalResolutions: Number(validatorInfo.totalResolutions),
        isActive: validatorInfo.isActive,
        slashCount: Number(validatorInfo.slashCount),
      };
    } catch (error) {
      console.error('Error fetching validator info:', error);
      throw error;
    }
  }

  /**
   * Get all active validators
   */
  async getActiveValidators() {
    try {
      const validators = await this.contract.getActiveValidators();
      return validators;
    } catch (error) {
      console.error('Error fetching active validators:', error);
      throw error;
    }
  }

  /**
   * Check if address is active validator
   */
  async isActiveValidator(address: string) {
    try {
      return await this.contract.isActiveValidator(address);
    } catch (error) {
      console.error('Error checking validator status:', error);
      throw error;
    }
  }

  /**
   * Get staking contract address
   */
  getContractAddress() {
    return STAKING_CONTRACT_ADDRESS;
  }
}

export const stakingService = new StakingService();
export default stakingService;
