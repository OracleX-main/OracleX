#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const TruthMeshOracle_1 = require("./oracle/TruthMeshOracle");
const errorHandler_1 = require("./middleware/errorHandler");
const health_1 = require("./api/routes/health");
const markets_1 = require("./api/routes/markets");
const agents_1 = require("./api/routes/agents");
const sources_1 = require("./api/routes/sources");
dotenv_1.default.config();
class OracleServer {
    constructor() {
        this.app = (0, express_1.default)();
        this.server = (0, http_1.createServer)(this.app);
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: config_1.config.FRONTEND_URL,
                methods: ['GET', 'POST']
            }
        });
        this.oracle = new TruthMeshOracle_1.TruthMeshOracle(this.io);
    }
    setupMiddleware() {
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)({
            origin: config_1.config.FRONTEND_URL,
            credentials: true
        }));
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000,
            max: 100,
            message: 'Too many requests from this IP'
        });
        this.app.use('/api/', limiter);
        this.app.use((0, compression_1.default)());
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((req, res, next) => {
            logger_1.logger.info(`${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            next();
        });
    }
    setupRoutes() {
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version || '1.0.0'
            });
        });
        this.app.use('/api/v1/health', health_1.healthRoutes);
        this.app.use('/api/v1/markets', markets_1.marketsRoutes);
        this.app.use('/api/v1/agents', agents_1.agentsRoutes);
        this.app.use('/api/v1/sources', sources_1.sourcesRoutes);
        this.app.get('/', (req, res) => {
            res.json({
                name: 'TruthMesh AI Oracle API',
                version: '1.0.0',
                status: 'operational',
                docs: '/docs',
                websocket: true
            });
        });
        this.app.use(errorHandler_1.errorHandler);
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Route not found',
                path: req.originalUrl
            });
        });
    }
    setupWebSocket() {
        this.io.on('connection', (socket) => {
            logger_1.logger.info(`WebSocket client connected: ${socket.id}`);
            socket.on('subscribe:market', (marketId) => {
                socket.join(`market:${marketId}`);
                logger_1.logger.info(`Client ${socket.id} subscribed to market ${marketId}`);
            });
            socket.on('unsubscribe:market', (marketId) => {
                socket.leave(`market:${marketId}`);
                logger_1.logger.info(`Client ${socket.id} unsubscribed from market ${marketId}`);
            });
            socket.on('disconnect', () => {
                logger_1.logger.info(`WebSocket client disconnected: ${socket.id}`);
            });
        });
    }
    async start() {
        try {
            this.setupMiddleware();
            this.setupRoutes();
            this.setupWebSocket();
            logger_1.logger.info('🔮 Initializing TruthMesh AI Oracle System...');
            await this.oracle.initialize();
            const PORT = config_1.config.PORT || 8000;
            this.server.listen(PORT, () => {
                logger_1.logger.info(`🚀 TruthMesh AI Oracle Server running on port ${PORT}`);
                logger_1.logger.info(`📊 Environment: ${config_1.config.NODE_ENV}`);
                logger_1.logger.info(`🔗 WebSocket enabled`);
                logger_1.logger.info(`📚 API Documentation: http://localhost:${PORT}/docs`);
            });
            process.on('SIGTERM', this.shutdown.bind(this));
            process.on('SIGINT', this.shutdown.bind(this));
        }
        catch (error) {
            logger_1.logger.error('Failed to start Oracle server:', error);
            process.exit(1);
        }
    }
    async shutdown() {
        logger_1.logger.info('🛑 Shutting down Oracle server...');
        try {
            await this.oracle.cleanup();
            this.server.close(() => {
                logger_1.logger.info('✅ Server shutdown complete');
                process.exit(0);
            });
        }
        catch (error) {
            logger_1.logger.error('Error during shutdown:', error);
            process.exit(1);
        }
    }
}
const oracleServer = new OracleServer();
oracleServer.start().catch((error) => {
    logger_1.logger.error('Fatal error starting Oracle server:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map