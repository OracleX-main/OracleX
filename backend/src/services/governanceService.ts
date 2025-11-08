import { ethers } from 'ethers';
import GovernanceDAOABI from '../abis/GovernanceDAO.json';

const GOVERNANCE_CONTRACT_ADDRESS = process.env.GOVERNANCE_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.BSC_TESTNET_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com';

class GovernanceService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.contract = new ethers.Contract(
      GOVERNANCE_CONTRACT_ADDRESS,
      GovernanceDAOABI.abi,
      this.provider
    );
  }

  /**
   * Get proposal information
   */
  async getProposal(proposalId: number) {
    try {
      const proposal = await this.contract.getProposal(proposalId);
      return {
        id: Number(proposal.id),
        proposer: proposal.proposer,
        title: proposal.title,
        description: proposal.description,
        votesFor: ethers.formatEther(proposal.votesFor),
        votesAgainst: ethers.formatEther(proposal.votesAgainst),
        votesAbstain: ethers.formatEther(proposal.votesAbstain),
        totalVotingPower: ethers.formatEther(proposal.totalVotingPower),
        createdAt: Number(proposal.createdAt),
        votingStartsAt: Number(proposal.votingStartsAt),
        votingEndsAt: Number(proposal.votingEndsAt),
        status: Number(proposal.status),
        quorumRequired: ethers.formatEther(proposal.quorumRequired),
        approvalThreshold: Number(proposal.approvalThreshold),
        executed: proposal.executed,
      };
    } catch (error) {
      console.error('Error fetching proposal:', error);
      throw error;
    }
  }

  /**
   * Get all proposals
   */
  async getAllProposals() {
    try {
      const totalProposals = await this.contract.getTotalProposals();
      const proposals = [];

      for (let i = 0; i < Number(totalProposals); i++) {
        const proposal = await this.getProposal(i);
        proposals.push(proposal);
      }

      return proposals;
    } catch (error) {
      console.error('Error fetching all proposals:', error);
      throw error;
    }
  }

  /**
   * Get active proposals
   */
  async getActiveProposals() {
    try {
      const activeProposalIds = await this.contract.getActiveProposals();
      const proposals = [];

      for (const id of activeProposalIds) {
        const proposal = await this.getProposal(Number(id));
        proposals.push(proposal);
      }

      return proposals;
    } catch (error) {
      console.error('Error fetching active proposals:', error);
      throw error;
    }
  }

  /**
   * Get proposals by status
   */
  async getProposalsByStatus(status: number) {
    try {
      const proposalIds = await this.contract.getProposalsByStatus(status);
      const proposals = [];

      for (const id of proposalIds) {
        const proposal = await this.getProposal(Number(id));
        proposals.push(proposal);
      }

      return proposals;
    } catch (error) {
      console.error('Error fetching proposals by status:', error);
      throw error;
    }
  }

  /**
   * Get vote information
   */
  async getVote(proposalId: number, voter: string) {
    try {
      const vote = await this.contract.getVote(proposalId, voter);
      return {
        choice: Number(vote.choice),
        votingPower: ethers.formatEther(vote.votingPower),
        timestamp: Number(vote.timestamp),
      };
    } catch (error) {
      console.error('Error fetching vote:', error);
      throw error;
    }
  }

  /**
   * Get voting power for an address
   */
  async getVotingPower(address: string) {
    try {
      const votingPower = await this.contract.getVotingPower(address);
      return ethers.formatEther(votingPower);
    } catch (error) {
      console.error('Error fetching voting power:', error);
      throw error;
    }
  }

  /**
   * Check if address can propose
   */
  async canPropose(address: string) {
    try {
      return await this.contract.canPropose(address);
    } catch (error) {
      console.error('Error checking can propose:', error);
      throw error;
    }
  }

  /**
   * Check if address can vote
   */
  async canVote(proposalId: number, address: string) {
    try {
      return await this.contract.canVote(proposalId, address);
    } catch (error) {
      console.error('Error checking can vote:', error);
      throw error;
    }
  }

  /**
   * Get total proposals count
   */
  async getTotalProposals() {
    try {
      const total = await this.contract.getTotalProposals();
      return Number(total);
    } catch (error) {
      console.error('Error fetching total proposals:', error);
      throw error;
    }
  }

  /**
   * Get governance contract address
   */
  getContractAddress() {
    return GOVERNANCE_CONTRACT_ADDRESS;
  }
}

export const governanceService = new GovernanceService();
export default governanceService;
