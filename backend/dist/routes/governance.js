"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const governanceService_1 = require("../services/governanceService");
const router = express_1.default.Router();
router.get('/proposals', async (req, res) => {
    try {
        const { status, limit } = req.query;
        let proposals;
        if (status) {
            proposals = await governanceService_1.governanceService.getProposalsByStatus(Number(status));
        }
        else {
            proposals = await governanceService_1.governanceService.getAllProposals();
        }
        if (limit) {
            proposals = proposals.slice(0, Number(limit));
        }
        res.json({
            success: true,
            data: proposals,
            total: proposals.length,
        });
    }
    catch (error) {
        console.error('Error fetching proposals:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch proposals',
        });
    }
});
router.get('/proposals/active', async (req, res) => {
    try {
        const proposals = await governanceService_1.governanceService.getActiveProposals();
        res.json({
            success: true,
            data: proposals,
            total: proposals.length,
        });
    }
    catch (error) {
        console.error('Error fetching active proposals:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch active proposals',
        });
    }
});
router.get('/proposals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const proposal = await governanceService_1.governanceService.getProposal(Number(id));
        res.json({
            success: true,
            data: proposal,
        });
    }
    catch (error) {
        console.error('Error fetching proposal:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch proposal',
        });
    }
});
router.get('/proposals/:id/votes/:address', async (req, res) => {
    try {
        const { id, address } = req.params;
        const vote = await governanceService_1.governanceService.getVote(Number(id), address);
        res.json({
            success: true,
            data: vote,
        });
    }
    catch (error) {
        console.error('Error fetching vote:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch vote',
        });
    }
});
router.get('/voting-power/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const votingPower = await governanceService_1.governanceService.getVotingPower(address);
        const canPropose = await governanceService_1.governanceService.canPropose(address);
        res.json({
            success: true,
            data: {
                votingPower,
                canPropose,
            },
        });
    }
    catch (error) {
        console.error('Error fetching voting power:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch voting power',
        });
    }
});
router.get('/can-vote/:proposalId/:address', async (req, res) => {
    try {
        const { proposalId, address } = req.params;
        const canVote = await governanceService_1.governanceService.canVote(Number(proposalId), address);
        res.json({
            success: true,
            data: { canVote },
        });
    }
    catch (error) {
        console.error('Error checking can vote:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to check voting eligibility',
        });
    }
});
router.get('/stats', async (req, res) => {
    try {
        const totalProposals = await governanceService_1.governanceService.getTotalProposals();
        const activeProposals = await governanceService_1.governanceService.getActiveProposals();
        const passedProposals = await governanceService_1.governanceService.getProposalsByStatus(2);
        res.json({
            success: true,
            data: {
                totalProposals,
                activeProposals: activeProposals.length,
                passedProposals: passedProposals.length,
                contractAddress: governanceService_1.governanceService.getContractAddress(),
            },
        });
    }
    catch (error) {
        console.error('Error fetching governance stats:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch governance stats',
        });
    }
});
exports.default = router;
//# sourceMappingURL=governance.js.map