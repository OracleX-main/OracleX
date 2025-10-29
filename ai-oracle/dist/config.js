"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '8000'),
    HOST: process.env.HOST || '0.0.0.0',
    DEBUG: process.env.NODE_ENV === 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/oraclex',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    WEB3_PROVIDER_URL: process.env.WEB3_PROVIDER_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
    ORACLE_CONTRACT_ADDRESS: process.env.ORACLE_CONTRACT_ADDRESS || '',
    ORACLE_PRIVATE_KEY: process.env.ORACLE_PRIVATE_KEY || '',
    CHAIN_ID: parseInt(process.env.CHAIN_ID || '97'),
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
    COINGECKO_API_KEY: process.env.COINGECKO_API_KEY || '',
    NEWS_API_KEY: process.env.NEWS_API_KEY || '',
    TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN || '',
    REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID || '',
    REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET || '',
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY || '',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001',
    MIN_CONSENSUS_THRESHOLD: parseFloat(process.env.MIN_CONSENSUS_THRESHOLD || '0.6'),
    MAX_RESOLUTION_TIME: parseInt(process.env.MAX_RESOLUTION_TIME || '3600000'),
    DISPUTE_WINDOW: parseInt(process.env.DISPUTE_WINDOW || '1800000'),
    AGENT_TIMEOUT: parseInt(process.env.AGENT_TIMEOUT || '30000'),
    MAX_RETRIES: parseInt(process.env.MAX_RETRIES || '3'),
    RETRY_DELAY: parseInt(process.env.RETRY_DELAY || '5000'),
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    LOG_FORMAT: process.env.LOG_FORMAT || 'json',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    ALLOWED_HOSTS: process.env.ALLOWED_HOSTS?.split(',') || ['localhost', '127.0.0.1'],
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
    RATE_LIMIT_MAX_REQUESTS: 100,
    METRICS_PORT: parseInt(process.env.METRICS_PORT || '9090'),
    HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
    DATA_SOURCE_TIMEOUT: parseInt(process.env.DATA_SOURCE_TIMEOUT || '10000'),
    MAX_DATA_POINTS: parseInt(process.env.MAX_DATA_POINTS || '100'),
    API_WORKERS: parseInt(process.env.API_WORKERS || '4'),
};
//# sourceMappingURL=config.js.map