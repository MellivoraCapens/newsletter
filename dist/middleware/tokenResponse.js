"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTokenResponse = void 0;
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + +process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false,
    };
    if (process.env.NODE_ENV === "product") {
        options.secure = true;
    }
    res
        .status(statusCode)
        .cookie("token", token, options)
        .json({ success: true, token });
};
exports.sendTokenResponse = sendTokenResponse;
