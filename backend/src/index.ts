import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

// Import routes
import authRoutes from './routes/auth';
import marketRoutes from './routes/markets';
import oracleRoutes from './routes/oracles';
import userRoutes from './routes/users';
import analyticsRoutes from './routes/analytics';
import stakingRoutes from './routes/staking';
import governanceRoutes from './routes/governance';
import disputeRoutes from './routes/disputes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    config.FRONTEND_URL
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined', { 
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/markets', marketRoutes); // Remove auth middleware for market browsing
app.use('/api/oracles', authMiddleware, oracleRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/staking', stakingRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/disputes', disputeRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

const PORT = config.PORT || 3001;

// Store blockchain sync service reference for graceful shutdown
let blockchainSyncService: any = null;

app.listen(PORT, async () => {
  logger.info(`🚀 OracleX Backend API running on port ${PORT}`);
  logger.info(`📊 Environment: ${config.NODE_ENV}`);
  logger.info(`🔗 Database: ${config.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  
  // Start blockchain sync service (optional)
  const enableBlockchainSync = process.env.ENABLE_BLOCKCHAIN_SYNC !== 'false';
  
  if (enableBlockchainSync && process.env.MARKET_FACTORY_ADDRESS) {
    try {
      const { getBlockchainSyncService } = await import('./services/blockchainSync');
      const blockchainSyncService = getBlockchainSyncService();
      await blockchainSyncService.start();
      logger.info('✅ Blockchain sync service started');
    } catch (error) {
      logger.error('Failed to start blockchain sync service:', error);
      logger.warn('⚠️ Backend running without blockchain sync');
    }
  } else {
    if (!process.env.MARKET_FACTORY_ADDRESS) {
      logger.info('📴 Blockchain sync disabled: MARKET_FACTORY_ADDRESS not configured');
    } else {
      logger.info('� Blockchain sync disabled via ENABLE_BLOCKCHAIN_SYNC=false');
    }
    logger.info('💡 Backend running in database-only mode');
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (blockchainSyncService) {
    blockchainSyncService.stop();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  if (blockchainSyncService) {
    blockchainSyncService.stop();
  }
  process.exit(0);
});

export default app;