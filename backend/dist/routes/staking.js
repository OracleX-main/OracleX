"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stakingService_1 = require("../services/stakingService");
const router = express_1.default.Router();
router.get('/info/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const stakeInfo = await stakingService_1.stakingService.getStakeInfo(address);
        const pendingRewards = await stakingService_1.stakingService.getPendingRewards(address);
        res.json({
            success: true,
            data: {
                ...stakeInfo,
                pendingRewards,
            },
        });
    }
    catch (error) {
        console.error('Error fetching staking info:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch staking info',
        });
    }
});
router.get('/overview', async (req, res) => {
    try {
        const totalStaked = await stakingService_1.stakingService.getTotalStaked();
        const apy = await stakingService_1.stakingService.getCurrentAPY();
        res.json({
            success: true,
            data: {
                totalStaked,
                currentAPY: apy,
                contractAddress: stakingService_1.stakingService.getContractAddress(),
            },
        });
    }
    catch (error) {
        console.error('Error fetching staking overview:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch staking overview',
        });
    }
});
router.get('/validators', async (req, res) => {
    try {
        const validatorAddresses = await stakingService_1.stakingService.getActiveValidators();
        const validators = [];
        for (const address of validatorAddresses) {
            const validatorInfo = await stakingService_1.stakingService.getValidatorInfo(address);
            validators.push(validatorInfo);
        }
        res.json({
            success: true,
            data: validators,
        });
    }
    catch (error) {
        console.error('Error fetching validators:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch validators',
        });
    }
});
router.get('/validator/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const validatorInfo = await stakingService_1.stakingService.getValidatorInfo(address);
        const isActive = await stakingService_1.stakingService.isActiveValidator(address);
        res.json({
            success: true,
            data: {
                ...validatorInfo,
                isActive,
            },
        });
    }
    catch (error) {
        console.error('Error fetching validator info:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch validator info',
        });
    }
});
exports.default = router;
//# sourceMappingURL=staking.js.map