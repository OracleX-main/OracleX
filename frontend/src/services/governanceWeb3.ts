import { ethers, BrowserProvider } from 'ethers';
import GovernanceDAOABI from '../abis/GovernanceDAO.json';

const GOVERNANCE_CONTRACT_ADDRESS = import.meta.env.VITE_GOVERNANCE_CONTRACT_ADDRESS || '';

class GovernanceWeb3Service {
  private getProvider(): BrowserProvider {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    return new BrowserProvider(window.ethereum);
  }

  /**
   * Create a new proposal
   */
  async createProposal(
    title: string,
    description: string,
    targetContract: string = ethers.ZeroAddress,
    executionData: string = '0x'
  ) {
    try {
      const provider = this.getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(GOVERNANCE_CONTRACT_ADDRESS, GovernanceDAOABI.abi, signer);

      const tx = await contract.createProposal(title, description, targetContract, executionData);
      await tx.wait();

      return tx.hash;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  }

  /**
   * Cast a vote on a proposal
   */
  async castVote(proposalId: number, voteChoice: number) {
    try {
      const provider = this.getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(GOVERNANCE_CONTRACT_ADDRESS, GovernanceDAOABI.abi, signer);

      const tx = await contract.castVote(proposalId, voteChoice);
      await tx.wait();

      return tx.hash;
    } catch (error) {
      console.error('Error casting vote:', error);
      throw error;
    }
  }

  /**
   * Finalize a proposal
   */
  async finalizeProposal(proposalId: number) {
    try {
      const provider = this.getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(GOVERNANCE_CONTRACT_ADDRESS, GovernanceDAOABI.abi, signer);

      const tx = await contract.finalizeProposal(proposalId);
      await tx.wait();

      return tx.hash;
    } catch (error) {
      console.error('Error finalizing proposal:', error);
      throw error;
    }
  }

  /**
   * Execute a passed proposal
   */
  async executeProposal(proposalId: number) {
    try {
      const provider = this.getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(GOVERNANCE_CONTRACT_ADDRESS, GovernanceDAOABI.abi, signer);

      const tx = await contract.executeProposal(proposalId);
      await tx.wait();

      return tx.hash;
    } catch (error) {
      console.error('Error executing proposal:', error);
      throw error;
    }
  }

  /**
   * Cancel a proposal
   */
  async cancelProposal(proposalId: number) {
    try {
      const provider = this.getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(GOVERNANCE_CONTRACT_ADDRESS, GovernanceDAOABI.abi, signer);

      const tx = await contract.cancelProposal(proposalId);
      await tx.wait();

      return tx.hash;
    } catch (error) {
      console.error('Error cancelling proposal:', error);
      throw error;
    }
  }

  /**
   * Get contract address
   */
  getContractAddress() {
    return GOVERNANCE_CONTRACT_ADDRESS;
  }
}

export const governanceWeb3Service = new GovernanceWeb3Service();
export default governanceWeb3Service;
