import { Router, Request, Response } from 'express';
import { ethers } from 'ethers';
import { logger } from '../utils/logger';
import { config } from '../config';

const router = Router();

// Faucet configuration
const FAUCET_AMOUNT = ethers.parseEther('1000'); // 1000 ORX
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const lastClaims = new Map<string, number>(); // Track last claim time per address

// ORX Token ABI (minimal)
const ORX_TOKEN_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)'
];

/**
 * POST /api/faucet/claim
 * Claim test ORX tokens
 */
router.post('/claim', async (req: Request, res: Response) => {
  try {
    const { address, amount } = req.body;

    // Validate address
    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }

    // Check cooldown
    const lastClaimTime = lastClaims.get(address.toLowerCase());
    if (lastClaimTime) {
      const timeSinceLastClaim = Date.now() - lastClaimTime;
      if (timeSinceLastClaim < COOLDOWN_MS) {
        const remainingMs = COOLDOWN_MS - timeSinceLastClaim;
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        return res.status(429).json({
          success: false,
          error: `Please wait ${remainingSeconds} seconds before claiming again`,
          cooldownRemaining: remainingSeconds
        });
      }
    }

    // Check if we have the necessary environment variables
    const orxTokenAddress = config.ORX_TOKEN_ADDRESS || process.env.ORX_TOKEN_ADDRESS;
    const faucetPrivateKey = process.env.FAUCET_PRIVATE_KEY || config.PRIVATE_KEY;
    const rpcUrl = process.env.BSC_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com';

    if (!orxTokenAddress) {
      logger.error('ORX_TOKEN_ADDRESS not configured');
      return res.status(500).json({
        success: false,
        error: 'Faucet not configured - missing token address'
      });
    }

    if (!faucetPrivateKey) {
      logger.error('FAUCET_PRIVATE_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'Faucet not configured - missing private key'
      });
    }

    // Setup provider and signer
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(faucetPrivateKey, provider);
    const orxContract = new ethers.Contract(orxTokenAddress, ORX_TOKEN_ABI, wallet);

    // Check faucet balance
    const faucetBalance = await orxContract.balanceOf(wallet.address);
    if (faucetBalance < FAUCET_AMOUNT) {
      logger.error('Faucet balance too low:', ethers.formatEther(faucetBalance));
      return res.status(503).json({
        success: false,
        error: 'Faucet is currently empty. Please try again later.',
        faucetBalance: ethers.formatEther(faucetBalance)
      });
    }

    // Send tokens
    logger.info(`Sending ${ethers.formatEther(FAUCET_AMOUNT)} ORX to ${address}`);
    const tx = await orxContract.transfer(address, FAUCET_AMOUNT);
    
    logger.info(`Transaction sent: ${tx.hash}`);
    
    // Wait for confirmation (optional, comment out for faster response)
    const receipt = await tx.wait();
    logger.info(`Transaction confirmed: ${tx.hash} (Block: ${receipt?.blockNumber})`);

    // Update cooldown
    lastClaims.set(address.toLowerCase(), Date.now());

    // Clean up old entries (keep last 1000)
    if (lastClaims.size > 1000) {
      const entries = Array.from(lastClaims.entries());
      entries.sort((a, b) => b[1] - a[1]);
      lastClaims.clear();
      entries.slice(0, 1000).forEach(([addr, time]) => lastClaims.set(addr, time));
    }

    res.json({
      success: true,
      txHash: tx.hash,
      amount: ethers.formatEther(FAUCET_AMOUNT),
      recipient: address,
      blockNumber: receipt?.blockNumber,
      message: `Successfully sent ${ethers.formatEther(FAUCET_AMOUNT)} ORX`
    });

  } catch (error: any) {
    logger.error('Faucet claim error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to claim tokens',
      details: error.reason || error.code
    });
  }
});

/**
 * GET /api/faucet/info
 * Get faucet information
 */
router.get('/info', async (req: Request, res: Response) => {
  try {
    const orxTokenAddress = config.ORX_TOKEN_ADDRESS || process.env.ORX_TOKEN_ADDRESS;
    const rpcUrl = process.env.BSC_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com';
    const faucetPrivateKey = process.env.FAUCET_PRIVATE_KEY || config.PRIVATE_KEY;

    if (!orxTokenAddress || !faucetPrivateKey) {
      return res.json({
        success: false,
        configured: false,
        error: 'Faucet not configured'
      });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(faucetPrivateKey, provider);
    const orxContract = new ethers.Contract(orxTokenAddress, ORX_TOKEN_ABI, wallet);

    const balance = await orxContract.balanceOf(wallet.address);
    const symbol = await orxContract.symbol();
    const decimals = await orxContract.decimals();

    res.json({
      success: true,
      configured: true,
      faucetAddress: wallet.address,
      tokenAddress: orxTokenAddress,
      tokenSymbol: symbol,
      tokenDecimals: Number(decimals),
      faucetBalance: ethers.formatEther(balance),
      amountPerClaim: ethers.formatEther(FAUCET_AMOUNT),
      cooldownMinutes: COOLDOWN_MS / 60000,
      network: 'BSC Testnet',
      chainId: 97
    });

  } catch (error: any) {
    logger.error('Faucet info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get faucet info'
    });
  }
});

/**
 * GET /api/faucet/cooldown/:address
 * Check cooldown status for address
 */
router.get('/cooldown/:address', (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address'
      });
    }

    const lastClaimTime = lastClaims.get(address.toLowerCase());
    
    if (!lastClaimTime) {
      return res.json({
        success: true,
        canClaim: true,
        cooldownRemaining: 0
      });
    }

    const timeSinceLastClaim = Date.now() - lastClaimTime;
    const canClaim = timeSinceLastClaim >= COOLDOWN_MS;
    const cooldownRemaining = canClaim ? 0 : Math.ceil((COOLDOWN_MS - timeSinceLastClaim) / 1000);

    res.json({
      success: true,
      canClaim,
      cooldownRemaining,
      lastClaimTime: new Date(lastClaimTime).toISOString()
    });

  } catch (error: any) {
    logger.error('Cooldown check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check cooldown'
    });
  }
});

export default router;
