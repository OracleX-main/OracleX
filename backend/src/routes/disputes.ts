import express from 'express';
import { disputeService } from '../services/disputeService';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/disputes
 * Get all disputes
 */
router.get('/', async (req, res) => {
  try {
    const { status, limit } = req.query;
    
    let disputes;
    if (status === 'active') {
      disputes = await disputeService.getActiveDisputes();
    } else {
      disputes = await disputeService.getAllDisputes();
    }
    
    // Apply limit if specified
    if (limit) {
      disputes = disputes.slice(0, Number(limit));
    }
    
    res.json({
      success: true,
      data: disputes,
      total: disputes.length,
    });
  } catch (error: any) {
    console.error('Error fetching disputes:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch disputes',
    });
  }
});

/**
 * GET /api/disputes/active
 * Get active disputes
 */
router.get('/active', async (req, res) => {
  try {
    const disputes = await disputeService.getActiveDisputes();
    
    res.json({
      success: true,
      data: disputes,
      total: disputes.length,
    });
  } catch (error: any) {
    console.error('Error fetching active disputes:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch active disputes',
    });
  }
});

/**
 * GET /api/disputes/:id
 * Get dispute by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dispute = await disputeService.getDispute(Number(id));
    
    res.json({
      success: true,
      data: dispute,
    });
  } catch (error: any) {
    console.error('Error fetching dispute:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch dispute',
    });
  }
});

/**
 * GET /api/disputes/:id/votes/:address
 * Get vote for a dispute
 */
router.get('/:id/votes/:address', async (req, res) => {
  try {
    const { id, address } = req.params;
    const vote = await disputeService.getVote(Number(id), address);
    
    res.json({
      success: true,
      data: vote,
    });
  } catch (error: any) {
    console.error('Error fetching vote:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch vote',
    });
  }
});

/**
 * GET /api/disputes/:id/voters
 * Get all voters for a dispute
 */
router.get('/:id/voters', async (req, res) => {
  try {
    const { id } = req.params;
    const voters = await disputeService.getDisputeVoters(Number(id));
    
    res.json({
      success: true,
      data: voters,
      total: voters.length,
    });
  } catch (error: any) {
    console.error('Error fetching dispute voters:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch dispute voters',
    });
  }
});

/**
 * GET /api/disputes/can-vote/:disputeId/:address
 * Check if address can vote on dispute
 */
router.get('/can-vote/:disputeId/:address', async (req, res) => {
  try {
    const { disputeId, address } = req.params;
    const canVote = await disputeService.canVote(Number(disputeId), address);
    
    res.json({
      success: true,
      data: { canVote },
    });
  } catch (error: any) {
    console.error('Error checking can vote:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check voting eligibility',
    });
  }
});

/**
 * GET /api/disputes/stats
 * Get dispute statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const totalDisputes = await disputeService.getTotalDisputes();
    const activeDisputes = await disputeService.getActiveDisputes();
    
    res.json({
      success: true,
      data: {
        totalDisputes,
        activeDisputes: activeDisputes.length,
        contractAddress: disputeService.getContractAddress(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching dispute stats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch dispute stats',
    });
  }
});

export default router;
