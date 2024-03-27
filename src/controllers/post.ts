import { Request, Response, NextFunction } from "express";
import Post, { IPost } from "../models/Post";
import { asyncHandler } from "../middleware/async";
import { ErrorResponse } from "../utils/errorResponse";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.BUCKET_SECRET_KEY,
  },
  region: process.env.BUCKET_REGION,
});

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
      tags: req.body.tags,
      author: req.user.id,
    };

    const post = await Post.create(body);

    if (req.file) {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `post/${post.id}`,
        Body: req.file?.buffer,
        ContentType: req.file?.mimetype,
      };

      const comand = new PutObjectCommand(params);
      await s3.send(comand);
      await post.updateOne({ image: true });
    }

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
    const post = await Post.findById(req.params.id).populate("author").exec();

    if (!post) {
      return next(
        new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
      );
    }

    let url = "";

    if (post.image) {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `post/${req.params.id}`,
      };
      const command = new GetObjectCommand(params);
      url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    }

    res.status(200).json({
      success: true,
      data: post,
      imageUrl: url,
      author: post.author,
    });
  }
);

// @desc    show posts by tag
// @route   GET /newsletter/api/v1/post/:tag
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
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(
        new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
      );
    }

    if (!(req.user.id == post.author)) {
      return next(new ErrorResponse("Not autorized to access this route", 401));
    }

    if (post.image) {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `post/${req.params.id}`,
      };
      const command = new DeleteObjectCommand(params);
      s3.send(command);
    }

    await post.deleteOne();

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

    if (!post) {
      next(
        new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
      );
    }

    const includesUpvotes = post.upvotes.includes(req.user.id);
    const includesDownvotes = post.downvotes.includes(req.user.id);

    if (req.body.vote === 1) {
      if (includesUpvotes) {
        await post.updateOne({ $pull: { upvotes: { $in: [req.user.id] } } });
      }

      if (!includesUpvotes) {
        if (includesDownvotes) {
          await post.updateOne({
            $pull: { downvotes: { $in: [req.user.id] } },
          });
        }
        await post.updateOne({ $push: { upvotes: [req.user.id] } });
      }
    }

    if (req.body.vote === 0) {
      if (includesDownvotes) {
        await post.updateOne({ $pull: { downvotes: { $in: [req.user.id] } } });
      }

      if (!includesDownvotes) {
        if (includesUpvotes) {
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
