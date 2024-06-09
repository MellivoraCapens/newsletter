import { Request, Response, NextFunction } from "express";
import Comment, { IComment } from "../models/Comment";
import Post, { IPost } from "../models/Post";
import { asyncHandler } from "../middleware/async";
import { ErrorResponse } from "../utils/errorResponse";
import { ObjectId } from "mongoose";

// @desc    create comment to a post
// @route   POST /newsletter/api/v1/comment/post/:id
// @access  private
export const createComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = {
      comment: req.body.comment,
      author: req.user.id,
      authorNickname: req.user.nickname,
      postId: req.params.id,
      parentId: req.params.id,
    };

    const comment = await Comment.create(body);

    const post = await Post.findByIdAndUpdate(req.params.id, {
      $push: { comments: [comment.id] },
    });

    res.status(200).json({
      success: true,
      data: comment,
    });
  }
);

// @desc    create comment to a comment
// @route   POST /newsletter/api/v1/comment/comment/:id
// @access  private
export const createCommentToComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parentComment: IComment | any = await Comment.findById(req.params.id);

    if (!parentComment) {
      return next(
        new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
      );
    }

    if (parentComment.commentLayerCount >= 4) {
      return next(
        new ErrorResponse("No comments can be written under this comment", 403)
      );
    }

    const body = {
      comment: req.body.comment,
      author: req.user.id,
      parentId: req.params.id,
      postId: parentComment.postId,
      commentLayerCount: parentComment.commentLayerCount + 1,
    };

    const comment = await Comment.create(body);

    await parentComment.updateOne({
      $push: { comments: [comment.id] },
    });

    res.status(200).json({
      success: true,
      data: comment,
    });
  }
);

// @desc    delete comment
// @route   DELETE /newsletter/api/v1/comment/delete/:id
// @access  private
export const deleteComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(
        new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
      );
    }

    if (!(req.user.id == comment.author)) {
      return next(new ErrorResponse("Not autorized to access this route", 401));
    }

    await comment.deleteOne();

    const post = await Post.findByIdAndUpdate(comment.parentId, {
      $pull: { comments: { $in: [comment.id] } },
    });

    res.status(200).json({
      success: true,
      data: {},
      post,
    });
  }
);

// @desc    delete comment by post author
// @route   PUT /newsletter/api/v1/comment/delete/postauthor/:id
// @access  private
export const deleteCommentByPostAuthor = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const comment: IComment | any = await Comment.findById(req.params.id)
      .populate("parentId")
      .exec();

    if (!comment) {
      return next(
        new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
      );
    }

    if (req.user.id != comment.parentId.author) {
      return next(new ErrorResponse("Not autorized to access this route", 401));
    }

    await comment.updateOne({ comment: "Deleted Comment" });

    res.status(200).json({
      success: true,
      data: comment,
    });
  }
);

// @desc    handle votes for comment
// @route   PUT /newsletter/api/v1/comment/vote/:id
// @access  private
export const handleVotesForComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const comment: IComment | null = await Comment.findById(req.params.id);

    if (!comment) {
      return next(
        new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
      );
    }

    const includesUpvotes = comment.upvotes.includes(req.user.id);
    const includesDownvotes = comment.downvotes.includes(req.user.id);

    if (req.body.vote === 1) {
      if (includesUpvotes) {
        await comment.updateOne({ $pull: { upvotes: { $in: [req.user.id] } } });
      }

      if (!includesUpvotes) {
        if (includesDownvotes) {
          await comment.updateOne({
            $pull: { downvotes: { $in: [req.user.id] } },
          });
        }
        await comment.updateOne({ $push: { upvotes: [req.user.id] } });
      }
    }

    if (req.body.vote === 0) {
      if (includesDownvotes) {
        await comment.updateOne({
          $pull: { downvotes: { $in: [req.user.id] } },
        });
      }

      if (!includesDownvotes) {
        if (includesUpvotes) {
          await comment.updateOne({
            $pull: { upvotes: { $in: [req.user.id] } },
          });
        }
        await comment.updateOne({ $push: { downvotes: [req.user.id] } });
      }
    }
    const updatedComment: IComment | null = await Comment.findById(
      req.params.id
    );
    let count = 0;

    if (updatedComment) {
      count = updatedComment.upvotes.length - updatedComment.downvotes.length;
    }

    res.status(200).json({
      success: true,
      data: comment,
      votesCount: count,
    });
  }
);

// @desc    get comments by parent id
// @route   GET /newsletter/api/v1/comment/get/:id
// @access  private
export const getCommentByParentId = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let comments = await Comment.find({ parentId: req.params.id }).populate(
      "author"
    );

    if (!comments) {
      return next(
        new ErrorResponse(`Comment not found with tag of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      success: true,
      data: comments,
    });
  }
);

// @desc    delete comments from deleted post
// @route   DELETE /newsletter/api/v1/comment/delete/post/:id
// @access  private
export const deleteAllComments = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const comments = await Comment.deleteMany({ postId: req.params.id });

    res.status(200).json({
      success: true,
      comments,
    });
  }
);
