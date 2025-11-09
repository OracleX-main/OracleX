"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = require("./middleware/auth");
const auth_2 = __importDefault(require("./routes/auth"));
const markets_1 = __importDefault(require("./routes/markets"));
const oracles_1 = __importDefault(require("./routes/oracles"));
const users_1 = __importDefault(require("./routes/users"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const staking_1 = __importDefault(require("./routes/staking"));
const governance_1 = __importDefault(require("./routes/governance"));
const disputes_1 = __importDefault(require("./routes/disputes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:8080',
        'http://localhost:5173',
        config_1.config.FRONTEND_URL
    ],
    credentials: true
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP'
});
app.use('/api/', limiter);
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('combined', {
    stream: { write: (message) => logger_1.logger.info(message.trim()) }
}));
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version
    });
});
app.use('/api/auth', auth_2.default);
app.use('/api/markets', markets_1.default);
app.use('/api/oracles', auth_1.authMiddleware, oracles_1.default);
app.use('/api/users', auth_1.authMiddleware, users_1.default);
app.use('/api/analytics', auth_1.authMiddleware, analytics_1.default);
app.use('/api/staking', staking_1.default);
app.use('/api/governance', governance_1.default);
app.use('/api/disputes', disputes_1.default);
app.use(errorHandler_1.errorHandler);
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});
const PORT = config_1.config.PORT || 3001;
let blockchainSyncService = null;
app.listen(PORT, async () => {
    logger_1.logger.info(`🚀 OracleX Backend API running on port ${PORT}`);
    logger_1.logger.info(`📊 Environment: ${config_1.config.NODE_ENV}`);
    logger_1.logger.info(`🔗 Database: ${config_1.config.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    const enableBlockchainSync = process.env.ENABLE_BLOCKCHAIN_SYNC !== 'false';
    if (enableBlockchainSync && process.env.MARKET_FACTORY_ADDRESS) {
        try {
            const { getBlockchainSyncService } = await Promise.resolve().then(() => __importStar(require('./services/blockchainSync')));
            const blockchainSyncService = getBlockchainSyncService();
            await blockchainSyncService.start();
            logger_1.logger.info('✅ Blockchain sync service started');
        }
        catch (error) {
            logger_1.logger.error('Failed to start blockchain sync service:', error);
            logger_1.logger.warn('⚠️ Backend running without blockchain sync');
        }
    }
    else {
        if (!process.env.MARKET_FACTORY_ADDRESS) {
            logger_1.logger.info('📴 Blockchain sync disabled: MARKET_FACTORY_ADDRESS not configured');
        }
        else {
            logger_1.logger.info('� Blockchain sync disabled via ENABLE_BLOCKCHAIN_SYNC=false');
        }
        logger_1.logger.info('💡 Backend running in database-only mode');
    }
});
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    if (blockchainSyncService) {
        blockchainSyncService.stop();
    }
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    if (blockchainSyncService) {
        blockchainSyncService.stop();
    }
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=index.js.map