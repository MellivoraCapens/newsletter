import { Request, Response, NextFunction } from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";
import { asyncHandler } from "../middleware/async";
import { ErrorResponse } from "../utils/errorResponse";

// @desc    create comment
// @route   POST /newsletter/api/v1/comment/:id
// @access  private
export const createComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = {
      comment: req.body.comment,
      author: req.user.id,
      parentId: req.params.id,
    };

    const comment = await Comment.create(body);

    const post = await Post.findByIdAndUpdate(req.params.id, {
      $push: { comments: [comment.id] },
    });

    res.status(200).json({
      success: true,
      data: {
        post,
        comment,
      },
    });
  }
);
