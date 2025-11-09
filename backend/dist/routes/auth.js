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
const ethers_1 = require("ethers");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
const nonces = new Map();
router.post('/nonce', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { address } = req.body;
    if (!address || !ethers_1.ethers.isAddress(address)) {
        throw (0, errorHandler_1.createError)('Invalid Ethereum address', 400);
    }
    const nonce = Math.floor(Math.random() * 1000000).toString();
    nonces.set(address.toLowerCase(), nonce);
    setTimeout(() => {
        nonces.delete(address.toLowerCase());
    }, 10 * 60 * 1000);
    res.json({ nonce });
}));
router.post('/verify', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { address, signature } = req.body;
    if (!address || !signature) {
        throw (0, errorHandler_1.createError)('Address and signature required', 400);
    }
    const nonce = nonces.get(address.toLowerCase());
    if (!nonce) {
        throw (0, errorHandler_1.createError)('Nonce not found or expired', 400);
    }
    const message = `Welcome to OracleX! Your nonce: ${nonce}`;
    try {
        const recoveredAddress = ethers_1.ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            throw (0, errorHandler_1.createError)('Invalid signature', 401);
        }
        nonces.delete(address.toLowerCase());
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
        const prisma = new PrismaClient();
        let user = await prisma.user.findUnique({
            where: { walletAddress: address.toLowerCase() }
        });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    walletAddress: address.toLowerCase(),
                    username: `User_${address.substring(0, 6)}`,
                    reputation: 0
                }
            });
            logger_1.logger.info(`New user created: ${address}`);
        }
        await prisma.$disconnect();
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            address: user.walletAddress,
            username: user.username
        }, config_1.config.JWT_SECRET, { expiresIn: '7d' });
        logger_1.logger.info(`User authenticated: ${address}`);
        res.json({
            token,
            user: {
                id: user.id,
                address: user.walletAddress,
                username: user.username,
                reputation: user.reputation
            }
        });
    }
    catch (error) {
        throw (0, errorHandler_1.createError)('Signature verification failed', 401);
    }
}));
router.get('/me', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        throw (0, errorHandler_1.createError)('No token provided', 401);
    }
    const decoded = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET);
    res.json({
        user: {
            id: decoded.id,
            address: decoded.address
        }
    });
}));
exports.default = router;
//# sourceMappingURL=auth.js.map