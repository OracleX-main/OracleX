"use strict";
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
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.FRONTEND_URL,
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
app.use('/api/markets', auth_1.authMiddleware, markets_1.default);
app.use('/api/oracles', auth_1.authMiddleware, oracles_1.default);
app.use('/api/users', auth_1.authMiddleware, users_1.default);
app.use('/api/analytics', auth_1.authMiddleware, analytics_1.default);
app.use(errorHandler_1.errorHandler);
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});
const PORT = config_1.config.PORT || 3001;
app.listen(PORT, () => {
    logger_1.logger.info(`🚀 OracleX Backend API running on port ${PORT}`);
    logger_1.logger.info(`📊 Environment: ${config_1.config.NODE_ENV}`);
    logger_1.logger.info(`🔗 Database: ${config_1.config.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map