import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { asyncHandler } from "./async";
import { ErrorResponse } from "../utils/errorResponse";
import User from "../models/User";

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization?.startsWith("Bearer") &&
      req.headers.authorization
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }
    if (!token) {
      return next(
        new ErrorResponse("Not authorized to access this route", 401)
      );
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById((<any>decoded).id);
      next();
    } catch (err) {
      return next(
        new ErrorResponse("Not authorized to access this route", 401)
      );
    }
  }
);

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
