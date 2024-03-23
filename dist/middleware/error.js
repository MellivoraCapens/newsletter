"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorResponse_1 = require("../utils/errorResponse");
const errorHandler = (err, req, res, next) => {
    let error = new errorResponse_1.ErrorResponse(err.message, err.statusCode);
    if (err.name === "CastError") {
        const message = `User not found with id of ${err.value}`;
        error = new errorResponse_1.ErrorResponse(message, 404);
    }
    if (err.name === "ValidationError") {
        const printMessages = Object.values(err.errors).map((val) => val.messages);
        const message = `${printMessages}`;
        error = new errorResponse_1.ErrorResponse(message, 400);
    }
    if (err.code === 11000) {
        const message = `Duplicate field value entered`;
        error = new errorResponse_1.ErrorResponse(message, 400);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Server Error",
    });
};
exports.errorHandler = errorHandler;
