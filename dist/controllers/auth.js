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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.updateDetails = exports.resetPassword = exports.getMe = exports.register = exports.login = void 0;
const User_1 = __importDefault(require("../models/User"));
const errorResponse_1 = require("../utils/errorResponse");
const async_1 = require("../middleware/async");
const tokenResponse_1 = require("../middleware/tokenResponse");
const crypto = __importStar(require("node:crypto"));
// @desc    login user
// @route   POST /newsletter/api/v1/auth/login
// @access  public
exports.login = (0, async_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new errorResponse_1.ErrorResponse("Please provide an email and a password", 400));
    }
    const user = yield User_1.default.findOne({ email }).select("+password");
    if (!user) {
        return next(new errorResponse_1.ErrorResponse("Invalid credentials", 401));
    }
    // @ts-ignore
    const isMatch = yield user.matchPassword(password);
    if (!isMatch) {
        return next(new errorResponse_1.ErrorResponse("Invalid credentials", 401));
    }
    (0, tokenResponse_1.sendTokenResponse)(user, 200, res);
}));
// @desc    register user
// @route   POST /newsletter/api/v1/auth/register
// @access  public
exports.register = (0, async_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, surName, nickname, email, password } = req.body;
    const user = yield User_1.default.create({
        firstName,
        surName,
        nickname,
        email,
        password,
    });
    (0, tokenResponse_1.sendTokenResponse)(user, 200, res);
}));
// @desc    get current logged in user
// @route   GET /newsletter/api/v1/auth/me
// @access  private
exports.getMe = (0, async_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findById(req.user._id);
    res.status(200).json({
        success: true,
        data: user,
    });
}));
// @desc    reset password
// @route   PUT /newsletter/api/v1/auth/resetpassword/:resettoken
// @access  private
exports.resetPassword = (0, async_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resettoken)
        .digest("hex");
    const user = yield User_1.default.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now },
    });
    if (!user) {
        return next(new errorResponse_1.ErrorResponse("invalid token", 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    yield user.save();
    (0, tokenResponse_1.sendTokenResponse)(user, 200, res);
}));
// @desc    update user details
// @route   PUT /newsletter/api/v1/auth/updatedetails
// @access  private
exports.updateDetails = (0, async_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
    };
    const user = yield User_1.default.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        success: true,
        data: user,
    });
}));
// @desc    update password
// @route   PUT /newsletter/api/v1/auth/updatepassword
// @access  private
exports.updatePassword = (0, async_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findById(req.user._id).select("+password");
    if (!user) {
        return next(new errorResponse_1.ErrorResponse("User not found", 404));
    }
    // @ts-ignore
    if (!(yield user.matchPassword(req.body.currentPassword))) {
        return next(new errorResponse_1.ErrorResponse("Password is incorrect", 401));
    }
    user.password = req.body.newPassword;
    yield user.save();
    (0, tokenResponse_1.sendTokenResponse)(user, 200, res);
}));
