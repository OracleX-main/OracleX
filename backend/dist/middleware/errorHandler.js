"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.createError = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (error, req, res, next) => {
    const { statusCode = 500, message } = error;
    logger_1.logger.error(`Error ${statusCode}: ${message}`, {
        method: req.method,
        url: req.url,
        ip: req.ip,
        stack: error.stack
    });
    const isProduction = process.env.NODE_ENV === 'production';
    const errorMessage = isProduction && statusCode === 500
        ? 'Internal Server Error'
        : message;
    res.status(statusCode).json({
        error: {
            message: errorMessage,
            statusCode,
            ...(isProduction ? {} : { stack: error.stack })
        }
    });
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map