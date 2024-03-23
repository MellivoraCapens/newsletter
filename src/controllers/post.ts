import { Request, Response, NextFunction } from "express";
import Post, { IPost } from "../models/Post";
import User from "../models/User";
import { asyncHandler } from "../middleware/async";
import { ErrorResponse } from "../utils/errorResponse";

// @desc    create post
// @route   POST /newsletter/api/v1/post/createpost
// @access  private
export const createPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ErrorResponse("Only members could post", 401));
    }
    const body = {
      title: req.body.title,
      content: req.body.content,
      picture: req.body.picture,
      tags: req.body.tags,
      author: req.user.id,
    };

    const post = await Post.create(body);

    res.status(200).json({
      success: true,
      data: post,
    });
  }
);

// @desc    show single post
// @route   GET /newsletter/api/v1/post/get/:id
// @access  public
export const getPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const post = await Post.findById(req.params.id);
    const user = await User.findById(post?.author);

    if (!post) {
      return next(
        new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      success: true,
      data: post,
      author: user,
    });
  }
);

// @desc    show posts by tag
// @route   GET /newsletter/api/v1/post/get/:tag
// @access  public
export const getPostsByTag = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const posts = await Post.find({ tags: { $in: [req.params.tag] } });

    if (!posts) {
      return next(
        new ErrorResponse(`Post not found with tag of ${req.params.tag}`, 404)
      );
    }
    res.status(200).json({
      success: true,
      data: posts,
    });
  }
);

// @desc    delete post
// @route   DELETE /newsletter/api/v1/post/delete/:id
// @access  private
export const deletePost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return next(
        new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

// @desc    handle votes
// @route   PUT /newsletter/api/v1/post/vote/:id
// @access  private
export const handleVotes = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const post: IPost | any = await Post.findById(req.params.id);

    if (req.body.vote === 1) {
      if (post.upvotes.includes(req.user.id)) {
        await post.updateOne({ $pull: { upvotes: { $in: [req.user.id] } } });
      }

      if (!post.upvotes.includes(req.user.id)) {
        if (post.downvotes.includes(req.user.id)) {
          await post.updateOne({
            $pull: { downvotes: { $in: [req.user.id] } },
          });
        }
        await post.updateOne({ $push: { upvotes: [req.user.id] } });
      }
    }

    if (req.body.vote === 0) {
      if (post.downvotes.includes(req.user.id)) {
        await post.updateOne({ $pull: { downvotes: { $in: [req.user.id] } } });
      }

      if (!post.downvotes.includes(req.user.id)) {
        if (post.upvotes.includes(req.user.id)) {
          await post.updateOne({ $pull: { upvotes: { $in: [req.user.id] } } });
        }
        await post.updateOne({ $push: { downvotes: [req.user.id] } });
      }
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  }
);
