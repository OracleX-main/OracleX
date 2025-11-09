"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const disputeService_1 = require("../services/disputeService");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const { status, limit } = req.query;
        let disputes;
        if (status === 'active') {
            disputes = await disputeService_1.disputeService.getActiveDisputes();
        }
        else {
            disputes = await disputeService_1.disputeService.getAllDisputes();
        }
        if (limit) {
            disputes = disputes.slice(0, Number(limit));
        }
        res.json({
            success: true,
            data: disputes,
            total: disputes.length,
        });
    }
    catch (error) {
        console.error('Error fetching disputes:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch disputes',
        });
    }
});
router.get('/active', async (req, res) => {
    try {
        const disputes = await disputeService_1.disputeService.getActiveDisputes();
        res.json({
            success: true,
            data: disputes,
            total: disputes.length,
        });
    }
    catch (error) {
        console.error('Error fetching active disputes:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch active disputes',
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const dispute = await disputeService_1.disputeService.getDispute(Number(id));
        res.json({
            success: true,
            data: dispute,
        });
    }
    catch (error) {
        console.error('Error fetching dispute:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch dispute',
        });
    }
});
router.get('/:id/votes/:address', async (req, res) => {
    try {
        const { id, address } = req.params;
        const vote = await disputeService_1.disputeService.getVote(Number(id), address);
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
router.get('/:id/voters', async (req, res) => {
    try {
        const { id } = req.params;
        const voters = await disputeService_1.disputeService.getDisputeVoters(Number(id));
        res.json({
            success: true,
            data: voters,
            total: voters.length,
        });
    }
    catch (error) {
        console.error('Error fetching dispute voters:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch dispute voters',
        });
    }
});
router.get('/can-vote/:disputeId/:address', async (req, res) => {
    try {
        const { disputeId, address } = req.params;
        const canVote = await disputeService_1.disputeService.canVote(Number(disputeId), address);
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
        const totalDisputes = await disputeService_1.disputeService.getTotalDisputes();
        const activeDisputes = await disputeService_1.disputeService.getActiveDisputes();
        res.json({
            success: true,
            data: {
                totalDisputes,
                activeDisputes: activeDisputes.length,
                contractAddress: disputeService_1.disputeService.getContractAddress(),
            },
        });
    }
    catch (error) {
        console.error('Error fetching dispute stats:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch dispute stats',
        });
    }
});
exports.default = router;
//# sourceMappingURL=disputes.js.map