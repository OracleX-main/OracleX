"use strict";
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
        const token = jsonwebtoken_1.default.sign({ id: address, address }, config_1.config.JWT_SECRET, { expiresIn: '7d' });
        logger_1.logger.info(`User authenticated: ${address}`);
        res.json({
            token,
            user: {
                address,
                id: address
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