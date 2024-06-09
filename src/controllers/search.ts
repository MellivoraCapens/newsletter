import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middleware/async";
import { ErrorResponse } from "../utils/errorResponse";
import User from "../models/User";
import Post from "../models/Post";
import { s3 } from "../config/s3";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// @desc    user search
// @route   POST /newsletter/api/v1/search/user
// @access  private
export const userSearch = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const pipeline = {
      index: "userSearch",
      text: {
        query: req.body.query,
        path: ["nickname", "email", "firstName", "surName"],
        fuzzy: {
          maxEdits: 2,
          prefixLength: 0,
          maxExpansions: 50,
        },
      },
    };
    const users = await User.aggregate().search(pipeline);

    let data = [];

    for (const user of users) {
      let userData = { user, profilePictureUrl: "" };

      if (user.profilePicture) {
        const params = {
          Bucket: process.env.BUCKET_NAME,
          Key: `user/${user._id}`,
        };
        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(s3, command, {
          expiresIn: process.env.BUCKET_URL_EXPIRE,
        });
        userData.profilePictureUrl = url;
      }
      data.push(userData);
    }

    res.status(200).json({
      success: true,
      data,
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
    const posts = await Post.aggregate().search(pipeline);

    let data = [];

    for (const post of posts) {
      let postData = { post, profilePictureUrl: "", imageUrl: "" };

      const user = await User.findById(post.author);
      postData.post.author = user;
      if (user?.profilePicture) {
        const params = {
          Bucket: process.env.BUCKET_NAME,
          Key: `user/${user.id}`,
        };
        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(s3, command, {
          expiresIn: process.env.BUCKET_URL_EXPIRE,
        });
        postData.profilePictureUrl = url;
      }

      if (post.image) {
        const params = {
          Bucket: process.env.BUCKET_NAME,
          Key: `post/${post._id}`,
        };
        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(s3, command, {
          expiresIn: process.env.BUCKET_URL_EXPIRE,
        });
        postData.imageUrl = url;
      }
      data.push(postData);
    }

    res.status(200).json({
      success: true,
      data,
    });
  }
);

// @desc    user search auto complete
// @route   POST /newsletter/api/v1/search/user/auto
// @access  private
export const userAutoComplete = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const pipeline = [
      {
        $search: {
          index: "userAutocomplete",
          compound: {
            should: [
              {
                autocomplete: {
                  query: req.body.query,
                  path: "nickname",
                },
              },
              {
                autocomplete: {
                  query: req.body.query,
                  path: "email",
                },
              },
              {
                autocomplete: {
                  query: req.body.query,
                  path: "firstName",
                },
              },
              {
                autocomplete: {
                  query: req.body.query,
                  path: "surName",
                },
              },
            ],
          },
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          surName: 1,
          nickname: 1,
          email: 1,
        },
      },
    ];

    const users = await User.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: users,
    });
  }
);

// @desc    post search auto complete
// @route   POST /newsletter/api/v1/search/post/auto
// @access  private
export const postAutoComplete = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
