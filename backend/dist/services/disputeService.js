"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disputeService = void 0;
const ethers_1 = require("ethers");
const DisputeResolution_json_1 = __importDefault(require("../abis/DisputeResolution.json"));
const DISPUTE_CONTRACT_ADDRESS = process.env.DISPUTE_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.BSC_TESTNET_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com';
class DisputeService {
    constructor() {
        this.provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL);
        this.contract = new ethers_1.ethers.Contract(DISPUTE_CONTRACT_ADDRESS, DisputeResolution_json_1.default.abi, this.provider);
    }
    async getDispute(disputeId) {
        try {
            const dispute = await this.contract.getDispute(disputeId);
            return {
                market: dispute.market,
                disputer: dispute.disputer,
                disputedOutcome: Number(dispute.disputedOutcome),
                proposedOutcome: Number(dispute.proposedOutcome),
                reason: dispute.reason,
                disputeBond: ethers_1.ethers.formatEther(dispute.disputeBond),
                createdAt: Number(dispute.createdAt),
                votingEndsAt: Number(dispute.votingEndsAt),
                status: Number(dispute.status),
                upholdVotes: ethers_1.ethers.formatEther(dispute.upholdVotes),
                overturnVotes: ethers_1.ethers.formatEther(dispute.overturnVotes),
                totalVotingPower: ethers_1.ethers.formatEther(dispute.totalVotingPower),
                resolved: dispute.resolved,
                finalOutcome: Number(dispute.finalOutcome),
            };
        }
        catch (error) {
            console.error('Error fetching dispute:', error);
            throw error;
        }
    }
    async getAllDisputes() {
        try {
            const totalDisputes = await this.contract.getTotalDisputes();
            const disputes = [];
            for (let i = 0; i < Number(totalDisputes); i++) {
                const dispute = await this.getDispute(i);
                disputes.push(dispute);
            }
            return disputes;
        }
        catch (error) {
            console.error('Error fetching all disputes:', error);
            throw error;
        }
    }
    async getActiveDisputes() {
        try {
            const activeDisputeIds = await this.contract.getActiveDisputes();
            const disputes = [];
            for (const id of activeDisputeIds) {
                const dispute = await this.getDispute(Number(id));
                disputes.push(dispute);
            }
            return disputes;
        }
        catch (error) {
            console.error('Error fetching active disputes:', error);
            throw error;
        }
    }
    async getVote(disputeId, voter) {
        try {
            const vote = await this.contract.getVote(disputeId, voter);
            return {
                choice: Number(vote.choice),
                votingPower: ethers_1.ethers.formatEther(vote.votingPower),
                timestamp: Number(vote.timestamp),
                claimed: vote.claimed,
            };
        }
        catch (error) {
            console.error('Error fetching vote:', error);
            throw error;
        }
    }
    async getDisputeVoters(disputeId) {
        try {
            return await this.contract.getDisputeVoters(disputeId);
        }
        catch (error) {
            console.error('Error fetching dispute voters:', error);
            throw error;
        }
    }
    async canVote(disputeId, voter) {
        try {
            return await this.contract.canVote(disputeId, voter);
        }
        catch (error) {
            console.error('Error checking can vote:', error);
            throw error;
        }
    }
    async getTotalDisputes() {
        try {
            const total = await this.contract.getTotalDisputes();
            return Number(total);
        }
        catch (error) {
            console.error('Error fetching total disputes:', error);
            throw error;
        }
    }
    getContractAddress() {
        return DISPUTE_CONTRACT_ADDRESS;
    }
}
exports.disputeService = new DisputeService();
exports.default = exports.disputeService;
//# sourceMappingURL=disputeService.js.map