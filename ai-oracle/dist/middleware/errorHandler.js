"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
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
//# sourceMappingURL=errorHandler.js.map