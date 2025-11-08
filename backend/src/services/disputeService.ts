import { ethers } from 'ethers';
import DisputeResolutionABI from '../abis/DisputeResolution.json';

const DISPUTE_CONTRACT_ADDRESS = process.env.DISPUTE_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.BSC_TESTNET_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com';

class DisputeService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.contract = new ethers.Contract(
      DISPUTE_CONTRACT_ADDRESS,
      DisputeResolutionABI.abi,
      this.provider
    );
  }

  /**
   * Get dispute information
   */
  async getDispute(disputeId: number) {
    try {
      const dispute = await this.contract.getDispute(disputeId);
      return {
        market: dispute.market,
        disputer: dispute.disputer,
        disputedOutcome: Number(dispute.disputedOutcome),
        proposedOutcome: Number(dispute.proposedOutcome),
        reason: dispute.reason,
        disputeBond: ethers.formatEther(dispute.disputeBond),
        createdAt: Number(dispute.createdAt),
        votingEndsAt: Number(dispute.votingEndsAt),
        status: Number(dispute.status),
        upholdVotes: ethers.formatEther(dispute.upholdVotes),
        overturnVotes: ethers.formatEther(dispute.overturnVotes),
        totalVotingPower: ethers.formatEther(dispute.totalVotingPower),
        resolved: dispute.resolved,
        finalOutcome: Number(dispute.finalOutcome),
      };
    } catch (error) {
      console.error('Error fetching dispute:', error);
      throw error;
    }
  }

  /**
   * Get all disputes
   */
  async getAllDisputes() {
    try {
      const totalDisputes = await this.contract.getTotalDisputes();
      const disputes = [];

      for (let i = 0; i < Number(totalDisputes); i++) {
        const dispute = await this.getDispute(i);
        disputes.push(dispute);
      }

      return disputes;
    } catch (error) {
      console.error('Error fetching all disputes:', error);
      throw error;
    }
  }

  /**
   * Get active disputes
   */
  async getActiveDisputes() {
    try {
      const activeDisputeIds = await this.contract.getActiveDisputes();
      const disputes = [];

      for (const id of activeDisputeIds) {
        const dispute = await this.getDispute(Number(id));
        disputes.push(dispute);
      }

      return disputes;
    } catch (error) {
      console.error('Error fetching active disputes:', error);
      throw error;
    }
  }

  /**
   * Get vote information
   */
  async getVote(disputeId: number, voter: string) {
    try {
      const vote = await this.contract.getVote(disputeId, voter);
      return {
        choice: Number(vote.choice),
        votingPower: ethers.formatEther(vote.votingPower),
        timestamp: Number(vote.timestamp),
        claimed: vote.claimed,
      };
    } catch (error) {
      console.error('Error fetching vote:', error);
      throw error;
    }
  }

  /**
   * Get all voters for a dispute
   */
  async getDisputeVoters(disputeId: number) {
    try {
      return await this.contract.getDisputeVoters(disputeId);
    } catch (error) {
      console.error('Error fetching dispute voters:', error);
      throw error;
    }
  }

  /**
   * Check if user can vote on dispute
   */
  async canVote(disputeId: number, voter: string) {
    try {
      return await this.contract.canVote(disputeId, voter);
    } catch (error) {
      console.error('Error checking can vote:', error);
      throw error;
    }
  }

  /**
   * Get total disputes count
   */
  async getTotalDisputes() {
    try {
      const total = await this.contract.getTotalDisputes();
      return Number(total);
    } catch (error) {
      console.error('Error fetching total disputes:', error);
      throw error;
    }
  }

  /**
   * Get dispute contract address
   */
  getContractAddress() {
    return DISPUTE_CONTRACT_ADDRESS;
  }
}

export const disputeService = new DisputeService();
export default disputeService;
