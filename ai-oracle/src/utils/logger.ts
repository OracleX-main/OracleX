/**
 * Structured logging utility for TruthMesh AI Oracle System
 */

import winston from 'winston';
import { config } from '../config';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: logFormat,
  defaultMeta: {
    service: 'truthmesh-oracle',
    environment: config.NODE_ENV
  },
  transports: [
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/oracle-error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/oracle-combined.log'
    }),
    
    // Console transport
    new winston.transports.Console({
      format: config.NODE_ENV === 'development' ? consoleFormat : logFormat
    })
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/oracle-exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/oracle-rejections.log' })
  ]
});

// Create logs directory if it doesn't exist
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const logsDir = join(process.cwd(), 'logs');
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

// Helper functions for structured logging
export const logMarketResolution = (marketId: string, status: string, metadata?: any) => {
  logger.info('Market resolution event', {
    marketId,
    status,
    event: 'market_resolution',
    ...metadata
  });
};

export const logAgentActivity = (agentId: string, activity: string, metadata?: any) => {
  logger.info('Agent activity', {
    agentId,
    activity,
    event: 'agent_activity',
    ...metadata
  });
};

export const logConsensus = (marketId: string, outcome: string, confidence: number, metadata?: any) => {
  logger.info('Consensus reached', {
    marketId,
    outcome,
    confidence,
    event: 'consensus',
    ...metadata
  });
};

export const logBlockchainTransaction = (txHash: string, type: string, metadata?: any) => {
  logger.info('Blockchain transaction', {
    txHash,
    type,
    event: 'blockchain_tx',
    ...metadata
  });
};

export const logError = (error: Error, context?: string, metadata?: any) => {
  logger.error('Error occurred', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    context,
    event: 'error',
    ...metadata
  });
};

export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  logger.info('Performance metric', {
    operation,
    duration,
    event: 'performance',
    ...metadata
  });
};

// Performance timing helper
export const createTimer = (operation: string) => {
  const start = Date.now();
  
  return {
    end: (metadata?: any) => {
      const duration = Date.now() - start;
      logPerformance(operation, duration, metadata);
      return duration;
    }
  };
};

export default logger;