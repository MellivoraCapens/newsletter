import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { asyncHandler } from "../middleware/async";
import { ErrorResponse } from "../utils/errorResponse";

// @desc    create user
// @route   POST /newsletter/api/v1/user
// @access  private
export const createUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.create(req.body);
    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

// @desc    show all users
// @route   GET /newsletter/api/v1/user
// @access  public
export const getUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  }
);

// @desc    show single user
// @route   GET /newsletter/api/v1/user/:id
// @access  public
export const getUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(`user not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

// @desc    update user
// @route   PUT /newsletter/api/v1/user/:id
// @access  private
export const updateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(
        new ErrorResponse(
          `User role is not autorized to access this route`,
          401
        )
      );
    }

    if (req.body.password) {
      return next(
        new ErrorResponse(
          `User role is not autorized to access this route`,
          401
        )
      );
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

// @desc    delete user
// @route   DELETE /newsletter/api/v1/user/:id
// @access  private
export const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);
