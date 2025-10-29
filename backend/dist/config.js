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
    PORT: parseInt(process.env.PORT || '3001'),
    DATABASE_URL: process.env.DATABASE_URL || '',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    BLOCKCHAIN_RPC_URL: process.env.BLOCKCHAIN_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
    PRIVATE_KEY: process.env.PRIVATE_KEY || '',
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || '',
    AI_ORACLE_URL: process.env.AI_ORACLE_URL || 'http://localhost:8000',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    COINGECKO_API_KEY: process.env.COINGECKO_API_KEY || '',
    NEWS_API_KEY: process.env.NEWS_API_KEY || '',
    TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN || '',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'),
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
//# sourceMappingURL=config.js.map