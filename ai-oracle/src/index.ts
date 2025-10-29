#!/usr/bin/env node

/**
 * TruthMesh AI Oracle System
 * Main entry point for the Node.js/TypeScript AI Oracle service
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { config } from './config';
import { logger } from './utils/logger';
import { TruthMeshOracle } from './oracle/TruthMeshOracle';
import { errorHandler } from './middleware/errorHandler';

// API Routes
import { healthRoutes } from './api/routes/health';
import { marketsRoutes } from './api/routes/markets';
import { agentsRoutes } from './api/routes/agents';
import { sourcesRoutes } from './api/routes/sources';

// Load environment variables
dotenv.config();

class OracleServer {
  private app: express.Application;
  private server: any;
  private io: Server;
  private oracle: TruthMeshOracle;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: config.FRONTEND_URL,
        methods: ['GET', 'POST']
      }
    });
    this.oracle = new TruthMeshOracle(this.io);
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: config.FRONTEND_URL,
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP'
    });
    this.app.use('/api/', limiter);

    // Body parsing
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Logging middleware
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/v1/health', healthRoutes);
    this.app.use('/api/v1/markets', marketsRoutes);
    this.app.use('/api/v1/agents', agentsRoutes);
    this.app.use('/api/v1/sources', sourcesRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'TruthMesh AI Oracle API',
        version: '1.0.0',
        status: 'operational',
        docs: '/docs',
        websocket: true
      });
    });

    // Error handling
    this.app.use(errorHandler);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
      });
    });
  }

  private setupWebSocket(): void {
    this.io.on('connection', (socket) => {
      logger.info(`WebSocket client connected: ${socket.id}`);

      socket.on('subscribe:market', (marketId: string) => {
        socket.join(`market:${marketId}`);
        logger.info(`Client ${socket.id} subscribed to market ${marketId}`);
      });

      socket.on('unsubscribe:market', (marketId: string) => {
        socket.leave(`market:${marketId}`);
        logger.info(`Client ${socket.id} unsubscribed from market ${marketId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`WebSocket client disconnected: ${socket.id}`);
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Setup Express app
      this.setupMiddleware();
      this.setupRoutes();
      this.setupWebSocket();

      // Initialize Oracle system
      logger.info('🔮 Initializing TruthMesh AI Oracle System...');
      await this.oracle.initialize();

      // Start server
      const PORT = config.PORT || 8000;
      this.server.listen(PORT, () => {
        logger.info(`🚀 TruthMesh AI Oracle Server running on port ${PORT}`);
        logger.info(`📊 Environment: ${config.NODE_ENV}`);
        logger.info(`🔗 WebSocket enabled`);
        logger.info(`📚 API Documentation: http://localhost:${PORT}/docs`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));

    } catch (error) {
      logger.error('Failed to start Oracle server:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    logger.info('🛑 Shutting down Oracle server...');
    
    try {
      await this.oracle.cleanup();
      this.server.close(() => {
        logger.info('✅ Server shutdown complete');
        process.exit(0);
      });
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start the server
const oracleServer = new OracleServer();
oracleServer.start().catch((error) => {
  logger.error('Fatal error starting Oracle server:', error);
  process.exit(1);
});