import express from 'express';
import { ethers } from 'ethers';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = express.Router();

// Store nonces temporarily (in production, use Redis)
const nonces = new Map<string, string>();

// Generate nonce for wallet connection
router.post('/nonce', asyncHandler(async (req: any, res: any) => {
  const { address } = req.body;
  
  if (!address || !ethers.isAddress(address)) {
    throw createError('Invalid Ethereum address', 400);
  }

  const nonce = Math.floor(Math.random() * 1000000).toString();
  nonces.set(address.toLowerCase(), nonce);
  
  // Clean up old nonces (expire after 10 minutes)
  setTimeout(() => {
    nonces.delete(address.toLowerCase());
  }, 10 * 60 * 1000);

  res.json({ nonce });
}));

// Verify signature and generate JWT
router.post('/verify', asyncHandler(async (req: any, res: any) => {
  const { address, signature } = req.body;
  
  if (!address || !signature) {
    throw createError('Address and signature required', 400);
  }

  const nonce = nonces.get(address.toLowerCase());
  if (!nonce) {
    throw createError('Nonce not found or expired', 400);
  }

  const message = `Welcome to OracleX! Your nonce: ${nonce}`;
  
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw createError('Invalid signature', 401);
    }

    // Clean up used nonce
    nonces.delete(address.toLowerCase());

    // Generate JWT token
    const token = jwt.sign(
      { id: address, address },
      config.JWT_SECRET,
      { expiresIn: '7d' } // Use a literal string instead of config value
    );

    logger.info(`User authenticated: ${address}`);

    res.json({
      token,
      user: {
        address,
        id: address
      }
    });

  } catch (error) {
    throw createError('Signature verification failed', 401);
  }
}));

// Get current user info
router.get('/me', asyncHandler(async (req: any, res: any) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw createError('No token provided', 401);
  }

  const decoded = jwt.verify(token, config.JWT_SECRET) as any;
  
  res.json({
    user: {
      id: decoded.id,
      address: decoded.address
    }
  });
}));

export default router;