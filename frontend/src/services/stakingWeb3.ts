import { ethers, BrowserProvider } from 'ethers';
import StakingContractABI from '../abis/StakingContract.json';
import ORXTokenABI from '../abis/ORXToken.json';

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT_ADDRESS || '';
const ORX_TOKEN_ADDRESS = import.meta.env.VITE_ORX_TOKEN_ADDRESS || '';

class StakingWeb3Service {
  private getProvider(): BrowserProvider {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    return new BrowserProvider(window.ethereum);
  }

  /**
   * Check ORX token allowance
   */
  async checkAllowance(userAddress: string): Promise<bigint> {
    try {
      const provider = this.getProvider();
      const tokenContract = new ethers.Contract(ORX_TOKEN_ADDRESS, ORXTokenABI.abi, provider);
      const allowance = await tokenContract.allowance(userAddress, STAKING_CONTRACT_ADDRESS);
      return allowance;
    } catch (error) {
      console.error('Error checking allowance:', error);
      throw error;
    }
  }

  /**
   * Approve ORX tokens for staking
   */
  async approveTokens(amount: string): Promise<string> {
    try {
      const provider = this.getProvider();
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(ORX_TOKEN_ADDRESS, ORXTokenABI.abi, signer);

      const amountWei = ethers.parseEther(amount);
      const tx = await tokenContract.approve(STAKING_CONTRACT_ADDRESS, amountWei);
      await tx.wait();

      return tx.hash;
    } catch (error) {
      console.error('Error approving tokens:', error);
      throw error;
    }
  }

  /**
   * Stake ORX tokens (with automatic approval if needed)
   */
  async stakeTokens(amount: string, lockPeriod: number, asValidator: boolean = false) {
    try {
      const provider = this.getProvider();
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingContractABI.abi, signer);

      const amountWei = ethers.parseEther(amount);

      // Check current allowance
      const currentAllowance = await this.checkAllowance(userAddress);
      
      // Approve if insufficient allowance
      if (currentAllowance < amountWei) {
        await this.approveTokens(amount);
      }

      const tx = await contract.stakeTokens(amountWei, lockPeriod, asValidator);
      await tx.wait();

      return tx.hash;
    } catch (error) {
      console.error('Error staking tokens:', error);
      throw error;
    }
  }

  /**
   * Unstake tokens
   */
  async unstakeTokens(amount: string) {
    try {
      const provider = this.getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingContractABI.abi, signer);

      const amountWei = ethers.parseEther(amount);
      const tx = await contract.unstakeTokens(amountWei);
      await tx.wait();

      return tx.hash;
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      throw error;
    }
  }

  /**
   * Claim staking rewards
   */
  async claimRewards() {
    try {
      const provider = this.getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingContractABI.abi, signer);

      const tx = await contract.claimRewards();
      await tx.wait();

      return tx.hash;
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw error;
    }
  }

  /**
   * Get contract address
   */
  getContractAddress() {
    return STAKING_CONTRACT_ADDRESS;
  }
}

export const stakingWeb3Service = new StakingWeb3Service();
export default stakingWeb3Service;
