import express from 'express';
import { governanceService } from '../services/governanceService';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/governance/proposals
 * Get all proposals
 */
router.get('/proposals', async (req, res) => {
  try {
    const { status, limit } = req.query;
    
    let proposals;
    if (status) {
      proposals = await governanceService.getProposalsByStatus(Number(status));
    } else {
      proposals = await governanceService.getAllProposals();
    }
    
    // Apply limit if specified
    if (limit) {
      proposals = proposals.slice(0, Number(limit));
    }
    
    res.json({
      success: true,
      data: proposals,
      total: proposals.length,
    });
  } catch (error: any) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch proposals',
    });
  }
});

/**
 * GET /api/governance/proposals/active
 * Get active proposals
 */
router.get('/proposals/active', async (req, res) => {
  try {
    const proposals = await governanceService.getActiveProposals();
    
    res.json({
      success: true,
      data: proposals,
      total: proposals.length,
    });
  } catch (error: any) {
    console.error('Error fetching active proposals:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch active proposals',
    });
  }
});

/**
 * GET /api/governance/proposals/:id
 * Get proposal by ID
 */
router.get('/proposals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await governanceService.getProposal(Number(id));
    
    res.json({
      success: true,
      data: proposal,
    });
  } catch (error: any) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch proposal',
    });
  }
});

/**
 * GET /api/governance/proposals/:id/votes/:address
 * Get vote for a proposal
 */
router.get('/proposals/:id/votes/:address', async (req, res) => {
  try {
    const { id, address } = req.params;
    const vote = await governanceService.getVote(Number(id), address);
    
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
 * GET /api/governance/voting-power/:address
 * Get voting power for an address
 */
router.get('/voting-power/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const votingPower = await governanceService.getVotingPower(address);
    const canPropose = await governanceService.canPropose(address);
    
    res.json({
      success: true,
      data: {
        votingPower,
        canPropose,
      },
    });
  } catch (error: any) {
    console.error('Error fetching voting power:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch voting power',
    });
  }
});

/**
 * GET /api/governance/can-vote/:proposalId/:address
 * Check if address can vote on proposal
 */
router.get('/can-vote/:proposalId/:address', async (req, res) => {
  try {
    const { proposalId, address } = req.params;
    const canVote = await governanceService.canVote(Number(proposalId), address);
    
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
 * GET /api/governance/stats
 * Get governance statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const totalProposals = await governanceService.getTotalProposals();
    const activeProposals = await governanceService.getActiveProposals();
    const passedProposals = await governanceService.getProposalsByStatus(2); // Status.Passed = 2
    
    res.json({
      success: true,
      data: {
        totalProposals,
        activeProposals: activeProposals.length,
        passedProposals: passedProposals.length,
        contractAddress: governanceService.getContractAddress(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching governance stats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch governance stats',
    });
  }
});

export default router;
