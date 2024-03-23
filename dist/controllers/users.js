"use strict";
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
exports.deleteUser = exports.updateUser = exports.getUser = exports.getUsers = exports.createUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const async_1 = require("../middleware/async");
const errorResponse_1 = require("../utils/errorResponse");
// @desc    create user
// @route   POST /newsletter/api/v1/user
// @access  private
exports.createUser = (0, async_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.create(req.body);
    res.status(200).json({
        success: true,
        data: user,
    });
}));
// @desc    show all users
// @route   GET /newsletter/api/v1/user
// @access  public
exports.getUsers = (0, async_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User_1.default.find();
    res.status(200).json({
        success: true,
        count: users.length,
        data: users,
    });
}));
// @desc    show single user
// @route   GET /newsletter/api/v1/user/:id
// @access  public
exports.getUser = (0, async_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findById(req.params.id);
    if (!user) {
        return next(new errorResponse_1.ErrorResponse(`user not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        data: user,
    });
}));
// @desc    update user
// @route   PUT /newsletter/api/v1/user/:id
// @access  private
exports.updateUser = (0, async_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!user) {
        return next(new errorResponse_1.ErrorResponse(`User role is not autorized to access this route`, 401));
    }
    if (req.body.password) {
        return next(new errorResponse_1.ErrorResponse(`User role is not autorized to access this route`, 401));
    }
    res.status(200).json({
        success: true,
        data: user,
    });
}));
// @desc    delete user
// @route   DELETE /newsletter/api/v1/user/:id
// @access  private
exports.deleteUser = (0, async_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findByIdAndDelete(req.params.id);
    if (!user) {
        return next(new errorResponse_1.ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        data: {},
    });
}));
