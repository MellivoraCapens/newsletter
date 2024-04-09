import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middleware/async";
import { ErrorResponse } from "../utils/errorResponse";
import User from "../models/User";
import Post from "../models/Post";

// @desc    user search
// @route   POST /newsletter/api/v1/search/user
// @access  private
export const userSearch = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const pipeline = {
      index: "userSearch",
      text: {
        query: req.body.query,
        path: ["nickname", "email"],
        fuzzy: {
          maxEdits: 2,
          prefixLength: 0,
          maxExpansions: 50,
        },
      },
    };
    const users = await User.aggregate().search(pipeline);

    res.status(200).json({
      success: true,
      data: users,
    });
  }
);

// @desc    post search
// @route   POST /newsletter/api/v1/search/post
// @access  private
export const postSearch = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const pipeline = {
      index: "postSearch",
      text: {
        query: req.body.query,
        path: ["title", "content"],
        fuzzy: {
          maxEdits: 2,
          prefixLength: 0,
          maxExpansions: 50,
        },
      },
    };
    const users = await Post.aggregate().search(pipeline);

    res.status(200).json({
      success: true,
      data: users,
    });
  }
);
