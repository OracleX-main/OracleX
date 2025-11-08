import { ethers, BrowserProvider } from 'ethers';
import DisputeResolutionABI from '../abis/DisputeResolution.json';

const DISPUTE_CONTRACT_ADDRESS = import.meta.env.VITE_DISPUTE_CONTRACT_ADDRESS || '';

class DisputeWeb3Service {
  private getProvider(): BrowserProvider {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    return new BrowserProvider(window.ethereum);
  }

  /**
   * Open a new dispute
   */
  async openDispute(
    marketAddress: string,
    disputedOutcome: number,
    proposedOutcome: number,
    reason: string,
    bondAmount: string
  ) {
    try {
      const provider = this.getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(DISPUTE_CONTRACT_ADDRESS, DisputeResolutionABI.abi, signer);

      const bondWei = ethers.parseEther(bondAmount);
      const tx = await contract.openDispute(
        marketAddress,
        disputedOutcome,
        proposedOutcome,
        reason,
        { value: bondWei }
      );
      await tx.wait();

      return tx.hash;
    } catch (error) {
      console.error('Error opening dispute:', error);
      throw error;
    }
  }

  /**
   * Vote on a dispute
   */
  async voteOnDispute(disputeId: number, voteChoice: number) {
    try {
      const provider = this.getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(DISPUTE_CONTRACT_ADDRESS, DisputeResolutionABI.abi, signer);

      const tx = await contract.voteOnDispute(disputeId, voteChoice);
      await tx.wait();

      return tx.hash;
    } catch (error) {
      console.error('Error voting on dispute:', error);
      throw error;
    }
  }

  /**
   * Finalize a dispute
   */
  async finalizeDispute(disputeId: number) {
    try {
      const provider = this.getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(DISPUTE_CONTRACT_ADDRESS, DisputeResolutionABI.abi, signer);

      const tx = await contract.finalizeDispute(disputeId);
      await tx.wait();

      return tx.hash;
    } catch (error) {
      console.error('Error finalizing dispute:', error);
      throw error;
    }
  }

  /**
   * Claim voting reward
   */
  async claimVotingReward(disputeId: number) {
    try {
      const provider = this.getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(DISPUTE_CONTRACT_ADDRESS, DisputeResolutionABI.abi, signer);

      const tx = await contract.claimVotingReward(disputeId);
      await tx.wait();

      return tx.hash;
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  }

  /**
   * Get contract address
   */
  getContractAddress() {
    return DISPUTE_CONTRACT_ADDRESS;
  }
}

export const disputeWeb3Service = new DisputeWeb3Service();
export default disputeWeb3Service;
