import { Request, Response, NextFunction } from "express";
import User, { IUser, IUserDTO } from "../models/User";
import { ErrorResponse } from "../utils/errorResponse";
import { asyncHandler } from "../middleware/async";
import { sendTokenResponse } from "../middleware/tokenResponse";
import * as crypto from "node:crypto";
import { s3 } from "../config/s3";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// @desc    login user
// @route   POST /newsletter/api/v1/auth/login
// @access  public
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(
        new ErrorResponse("Please provide an email and a password", 400)
      );
    }

    const user: IUserDTO = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }
    // @ts-ignore
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    sendTokenResponse(user, 200, res);
  }
);

// @desc    register user
// @route   POST /newsletter/api/v1/auth/register
// @access  public
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, surName, nickname, email, password } = req.body;

    const user: IUserDTO | any = await User.create({
      firstName,
      surName,
      nickname,
      email,
      password,
    });

    sendTokenResponse(user, 200, res);
  }
);

// @desc    add profile picture
// @route   POST /newsletter/api/v1/auth/profilepicture
// @access  private
export const addProfilePicture = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(
        new ErrorResponse(`user not found with id of ${req.user.id}`, 404)
      );
    }

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `user/${user.id}`,
      Body: req.file?.buffer,
      ContentType: req.file?.mimetype,
    };
    const comand = new PutObjectCommand(params);
    await s3.send(comand);
    await user.updateOne({ profilePicture: true });

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

// @desc    delete profile picture
// @route   PUT /newsletter/api/v1/auth/deletepicture
// @access  private
export const deleteProfilePicture = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(
        new ErrorResponse(`user not found with id of ${req.user.id}`, 404)
      );
    }

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `user/${req.user.id}`,
    };
    const command = new DeleteObjectCommand(params);
    s3.send(command);

    await user.updateOne({ profilePicture: false });

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

// @desc    get current logged in user
// @route   GET /newsletter/api/v1/auth/me
// @access  private
export const getMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(
        new ErrorResponse(`user not found with id of ${req.user.id}`, 404)
      );
    }

    let url = "";

    if (user.profilePicture) {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `user/${req.user.id}`,
      };
      const command = new GetObjectCommand(params);
      url = await getSignedUrl(s3, command);
    } else {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: process.env.DEFAULT_PROFILE_PICTURE,
      };
      const command = new GetObjectCommand(params);
      url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    }

    res.status(200).json({
      success: true,
      data: user,
      imageUrl: url,
    });
  }
);

// @desc    reset password
// @route   PUT /newsletter/api/v1/auth/resetpassword/:resettoken
// @access  private
export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");
    const user: IUserDTO | null = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now },
    });

    if (!user) {
      return next(new ErrorResponse("invalid token", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  }
);

// @desc    update user details
// @route   PUT /newsletter/api/v1/auth/updatedetails
// @access  private
export const updateDetails = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

// @desc    update password
// @route   PUT /newsletter/api/v1/auth/updatepassword
// @access  private
export const updatePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user: IUserDTO = await User.findById(req.user._id).select(
      "+password"
    );

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }
    // @ts-ignore
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse("Password is incorrect", 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  }
);
