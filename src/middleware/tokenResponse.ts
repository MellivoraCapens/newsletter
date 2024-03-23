import { Response } from "express";
import { IUserDTO } from "../models/User";

export const sendTokenResponse = (
  user: IUserDTO,
  statusCode: number,
  res: Response
) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + +process.env.JWT_COOKIE_EXPIRE! * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: false,
  };
  if (process.env.NODE_ENV === "product") {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
