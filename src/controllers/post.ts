import { Request, Response, NextFunction } from "express";
import Post, { IPost } from "../models/Post";
import { asyncHandler } from "../middleware/async";
import { ErrorResponse } from "../utils/errorResponse";
import { s3 } from "../config/s3";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";

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
      const buffer = await sharp(req.file?.buffer)
        .toFormat("jpeg", {
          quality: 50,
        })
        .resize(1000)
        .toBuffer();
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `post/${post.id}`,
        Body: buffer,
        ContentType: "image/jpeg",
      };

      const comand = new PutObjectCommand(params);
      await s3.send(comand);
      await post.updateOne({ image: true });
    }

    let imageUrl = null;

    const updatedPost = await Post.findById(post.id);

    if (!updatedPost) {
      return next(new ErrorResponse(`Created post not found`, 404));
    }

    if (updatedPost.image) {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `post/${updatedPost.id}`,
      };
      const command = new GetObjectCommand(params);
      imageUrl = await getSignedUrl(s3, command, {
        expiresIn: process.env.BUCKET_URL_EXPIRE,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        post: updatedPost,
        imageUrl,
      },
    });
  }
);

// @desc    show single post
// @route   GET /newsletter/api/v1/post/get/:id
// @access  private
export const getPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const post: IPost | any = await Post.findById(req.params.id)
      .populate("author")
      .exec();

    if (!post) {
      return next(
        new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
      );
    }

    let imageUrl = null;

    if (post.image) {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `post/${req.params.id}`,
      };
      const command = new GetObjectCommand(params);
      imageUrl = await getSignedUrl(s3, command, {
        expiresIn: process.env.BUCKET_URL_EXPIRE,
      });
    }

    let profilePictureUrl = null;

    if (post.author.profilePicture) {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `user/${post.author.id}`,
      };
      const command = new GetObjectCommand(params);
      profilePictureUrl = await getSignedUrl(s3, command, {
        expiresIn: process.env.BUCKET_URL_EXPIRE,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        post,
        imageUrl,
        profilePictureUrl,
      },
    });
  }
);

// @desc    show posts by tag
// @route   GET /newsletter/api/v1/post/:tag
// @access  private
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

// @desc    show posts by last shared
// @route   POST /newsletter/api/v1/post
// @access  private
export const getPostsByDate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const posts: any = await Post.find({ author: { $ne: req.user.id } })
      .sort({ createdAt: -1 })
      .limit(10)
      .skip(req.body.page * 10)
      .populate("author");

    const data: any = [];

    for (const post of posts) {
      if (post.image) {
        const params = {
          Bucket: process.env.BUCKET_NAME,
          Key: `post/${post.id}`,
        };
        const command = new GetObjectCommand(params);
        const imageUrl = await getSignedUrl(s3, command, {
          expiresIn: process.env.BUCKET_URL_EXPIRE,
        });

        if (post.author.profilePicture) {
          const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: `user/${post.author.id}`,
          };
          const command = new GetObjectCommand(params);
          const profilePictureUrl = await getSignedUrl(s3, command, {
            expiresIn: process.env.BUCKET_URL_EXPIRE,
          });
          data.push({ post, imageUrl, profilePictureUrl });
        } else {
          data.push({ post, imageUrl });
        }
      } else {
        if (post.author.profilePicture) {
          const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: `user/${post.author.id}`,
          };
          const command = new GetObjectCommand(params);
          const profilePictureUrl = await getSignedUrl(s3, command, {
            expiresIn: process.env.BUCKET_URL_EXPIRE,
          });
          data.push({ post, profilePictureUrl });
        } else {
          data.push({ post: post });
        }
      }
    }

    res.status(200).json({
      success: true,
      data,
    });
  }
);

// @desc    show current users posts
// @route   POST /newsletter/api/v1/post/me
// @access  private
export const getUsersPosts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const posts = await Post.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .skip(req.body.page * 10);

    const data: any = [];

    for (const post of posts) {
      if (post.image) {
        const params = {
          Bucket: process.env.BUCKET_NAME,
          Key: `post/${post.id}`,
        };
        const command = new GetObjectCommand(params);
        const imageUrl = await getSignedUrl(s3, command, {
          expiresIn: process.env.BUCKET_URL_EXPIRE,
        });
        data.push({ post, imageUrl });
      } else {
        data.push({ post: post });
      }
    }

    res.status(200).json({
      success: true,
      data,
    });
  }
);

// @desc    show users posts
// @route   POST /newsletter/api/v1/post/user/:id
// @access  private
export const getOneUsersPosts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .skip(req.body.page * 10)
      .populate("author");

    const data: any = [];

    for (const post of posts) {
      if (post.image) {
        const params = {
          Bucket: process.env.BUCKET_NAME,
          Key: `post/${post.id}`,
        };
        const command = new GetObjectCommand(params);
        const imageUrl = await getSignedUrl(s3, command, {
          expiresIn: process.env.BUCKET_URL_EXPIRE,
        });
        data.push({ post, imageUrl });
      }
      if (!post.image) {
        data.push({ post: post });
      }
    }

    res.status(200).json({
      success: true,
      data,
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
    const post: IPost | null = await Post.findById(req.params.id);

    if (!post) {
      return next(
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

    const updatedPost: IPost | null = await Post.findById(req.params.id);
    let count = 0;

    if (updatedPost) {
      count = updatedPost.upvotes.length - updatedPost.downvotes.length;
    }

    res.status(200).json({
      success: true,
      data: updatedPost,
      votesCount: count,
    });
  }
);
