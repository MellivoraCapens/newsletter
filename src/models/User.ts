import mongoose, { Schema } from "mongoose";
import * as bcrypt from "bcryptjs";
import * as crypto from "node:crypto";
import * as jwt from "jsonwebtoken";

export interface IUser extends mongoose.Document {
  firstName: string;
  surName: string;
  nickname: string;
  email: string;
  password: string;
  role: string;
  age?: Date;
  profilePicture: string;
  resetPasswordToken: string | undefined;
  resetPasswordExpire: Date | undefined;
  createdAt: Date;
}

export interface IUserDTO extends IUser {
  _id: string;
  getSignedJwtToken: Function;
}

const UserSchema: Schema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [true, "Please add your first name"],
  },
  surName: {
    type: String,
    required: [true, "Please add Your sur name"],
  },
  nickname: {
    type: String,
    required: [true, "Please add a name"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  age: {
    type: Date,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt: string | number = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(`${this.password}`, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET as jwt.Secret, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export default mongoose.model("User", UserSchema);
