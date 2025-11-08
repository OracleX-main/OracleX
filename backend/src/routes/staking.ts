import express from 'express';
import { stakingService } from '../services/stakingService';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/staking/info/:address
 * Get staking info for a user
 */
router.get('/info/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const stakeInfo = await stakingService.getStakeInfo(address);
    const pendingRewards = await stakingService.getPendingRewards(address);
    
    res.json({
      success: true,
      data: {
        ...stakeInfo,
        pendingRewards,
      },
    });
  } catch (error: any) {
    console.error('Error fetching staking info:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch staking info',
    });
  }
});

/**
 * GET /api/staking/overview
 * Get staking overview (total staked, APY, etc.)
 */
router.get('/overview', async (req, res) => {
  try {
    const totalStaked = await stakingService.getTotalStaked();
    const apy = await stakingService.getCurrentAPY();
    
    res.json({
      success: true,
      data: {
        totalStaked,
        currentAPY: apy,
        contractAddress: stakingService.getContractAddress(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching staking overview:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch staking overview',
    });
  }
});

/**
 * GET /api/staking/validators
 * Get list of active validators
 */
router.get('/validators', async (req, res) => {
  try {
    const validatorAddresses = await stakingService.getActiveValidators();
    const validators = [];
    
    for (const address of validatorAddresses) {
      const validatorInfo = await stakingService.getValidatorInfo(address);
      validators.push(validatorInfo);
    }
    
    res.json({
      success: true,
      data: validators,
    });
  } catch (error: any) {
    console.error('Error fetching validators:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch validators',
    });
  }
});

/**
 * GET /api/staking/validator/:address
 * Get validator info
 */
router.get('/validator/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const validatorInfo = await stakingService.getValidatorInfo(address);
    const isActive = await stakingService.isActiveValidator(address);
    
    res.json({
      success: true,
      data: {
        ...validatorInfo,
        isActive,
      },
    });
  } catch (error: any) {
    console.error('Error fetching validator info:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch validator info',
    });
  }
});

export default router;
