"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTimer = exports.logPerformance = exports.logError = exports.logBlockchainTransaction = exports.logConsensus = exports.logAgentActivity = exports.logMarketResolution = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const config_1 = require("../config");
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
}), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({
    format: 'HH:mm:ss'
}), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return log;
}));
exports.logger = winston_1.default.createLogger({
    level: config_1.config.LOG_LEVEL,
    format: logFormat,
    defaultMeta: {
        service: 'truthmesh-oracle',
        environment: config_1.config.NODE_ENV
    },
    transports: [
        new winston_1.default.transports.File({
            filename: 'logs/oracle-error.log',
            level: 'error'
        }),
        new winston_1.default.transports.File({
            filename: 'logs/oracle-combined.log'
        }),
        new winston_1.default.transports.Console({
            format: config_1.config.NODE_ENV === 'development' ? consoleFormat : logFormat
        })
    ],
    exceptionHandlers: [
        new winston_1.default.transports.File({ filename: 'logs/oracle-exceptions.log' })
    ],
    rejectionHandlers: [
        new winston_1.default.transports.File({ filename: 'logs/oracle-rejections.log' })
    ]
});
const fs_1 = require("fs");
const path_1 = require("path");
const logsDir = (0, path_1.join)(process.cwd(), 'logs');
if (!(0, fs_1.existsSync)(logsDir)) {
    (0, fs_1.mkdirSync)(logsDir, { recursive: true });
}
const logMarketResolution = (marketId, status, metadata) => {
    exports.logger.info('Market resolution event', {
        marketId,
        status,
        event: 'market_resolution',
        ...metadata
    });
};
exports.logMarketResolution = logMarketResolution;
const logAgentActivity = (agentId, activity, metadata) => {
    exports.logger.info('Agent activity', {
        agentId,
        activity,
        event: 'agent_activity',
        ...metadata
    });
};
exports.logAgentActivity = logAgentActivity;
const logConsensus = (marketId, outcome, confidence, metadata) => {
    exports.logger.info('Consensus reached', {
        marketId,
        outcome,
        confidence,
        event: 'consensus',
        ...metadata
    });
};
exports.logConsensus = logConsensus;
const logBlockchainTransaction = (txHash, type, metadata) => {
    exports.logger.info('Blockchain transaction', {
        txHash,
        type,
        event: 'blockchain_tx',
        ...metadata
    });
};
exports.logBlockchainTransaction = logBlockchainTransaction;
const logError = (error, context, metadata) => {
    exports.logger.error('Error occurred', {
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
exports.logError = logError;
const logPerformance = (operation, duration, metadata) => {
    exports.logger.info('Performance metric', {
        operation,
        duration,
        event: 'performance',
        ...metadata
    });
};
exports.logPerformance = logPerformance;
const createTimer = (operation) => {
    const start = Date.now();
    return {
        end: (metadata) => {
            const duration = Date.now() - start;
            (0, exports.logPerformance)(operation, duration, metadata);
            return duration;
        }
    };
};
exports.createTimer = createTimer;
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map