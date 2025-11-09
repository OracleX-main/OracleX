"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.governanceService = void 0;
const ethers_1 = require("ethers");
const GovernanceDAO_json_1 = __importDefault(require("../abis/GovernanceDAO.json"));
const GOVERNANCE_CONTRACT_ADDRESS = process.env.GOVERNANCE_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.BSC_TESTNET_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com';
class GovernanceService {
    constructor() {
        this.provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL);
        this.contract = new ethers_1.ethers.Contract(GOVERNANCE_CONTRACT_ADDRESS, GovernanceDAO_json_1.default.abi, this.provider);
    }
    async getProposal(proposalId) {
        try {
            const proposal = await this.contract.getProposal(proposalId);
            return {
                id: Number(proposal.id),
                proposer: proposal.proposer,
                title: proposal.title,
                description: proposal.description,
                votesFor: ethers_1.ethers.formatEther(proposal.votesFor),
                votesAgainst: ethers_1.ethers.formatEther(proposal.votesAgainst),
                votesAbstain: ethers_1.ethers.formatEther(proposal.votesAbstain),
                totalVotingPower: ethers_1.ethers.formatEther(proposal.totalVotingPower),
                createdAt: Number(proposal.createdAt),
                votingStartsAt: Number(proposal.votingStartsAt),
                votingEndsAt: Number(proposal.votingEndsAt),
                status: Number(proposal.status),
                quorumRequired: ethers_1.ethers.formatEther(proposal.quorumRequired),
                approvalThreshold: Number(proposal.approvalThreshold),
                executed: proposal.executed,
            };
        }
        catch (error) {
            console.error('Error fetching proposal:', error);
            throw error;
        }
    }
    async getAllProposals() {
        try {
            const totalProposals = await this.contract.getTotalProposals();
            const proposals = [];
            for (let i = 0; i < Number(totalProposals); i++) {
                const proposal = await this.getProposal(i);
                proposals.push(proposal);
            }
            return proposals;
        }
        catch (error) {
            console.error('Error fetching all proposals:', error);
            throw error;
        }
    }
    async getActiveProposals() {
        try {
            const activeProposalIds = await this.contract.getActiveProposals();
            const proposals = [];
            for (const id of activeProposalIds) {
                const proposal = await this.getProposal(Number(id));
                proposals.push(proposal);
            }
            return proposals;
        }
        catch (error) {
            console.error('Error fetching active proposals:', error);
            throw error;
        }
    }
    async getProposalsByStatus(status) {
        try {
            const proposalIds = await this.contract.getProposalsByStatus(status);
            const proposals = [];
            for (const id of proposalIds) {
                const proposal = await this.getProposal(Number(id));
                proposals.push(proposal);
            }
            return proposals;
        }
        catch (error) {
            console.error('Error fetching proposals by status:', error);
            throw error;
        }
    }
    async getVote(proposalId, voter) {
        try {
            const vote = await this.contract.getVote(proposalId, voter);
            return {
                choice: Number(vote.choice),
                votingPower: ethers_1.ethers.formatEther(vote.votingPower),
                timestamp: Number(vote.timestamp),
            };
        }
        catch (error) {
            console.error('Error fetching vote:', error);
            throw error;
        }
    }
    async getVotingPower(address) {
        try {
            const votingPower = await this.contract.getVotingPower(address);
            return ethers_1.ethers.formatEther(votingPower);
        }
        catch (error) {
            console.error('Error fetching voting power:', error);
            throw error;
        }
    }
    async canPropose(address) {
        try {
            return await this.contract.canPropose(address);
        }
        catch (error) {
            console.error('Error checking can propose:', error);
            throw error;
        }
    }
    async canVote(proposalId, address) {
        try {
            return await this.contract.canVote(proposalId, address);
        }
        catch (error) {
            console.error('Error checking can vote:', error);
            throw error;
        }
    }
    async getTotalProposals() {
        try {
            const total = await this.contract.getTotalProposals();
            return Number(total);
        }
        catch (error) {
            console.error('Error fetching total proposals:', error);
            throw error;
        }
    }
    getContractAddress() {
        return GOVERNANCE_CONTRACT_ADDRESS;
    }
}
exports.governanceService = new GovernanceService();
exports.default = exports.governanceService;
//# sourceMappingURL=governanceService.js.map