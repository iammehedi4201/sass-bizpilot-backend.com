import { ENV } from "@/config";
import { AppError } from "@/helper/errorHelper/appError";
import { verifyToken } from "@/helper/jwtHelper";
import { IJwtPayload, TUserRoles } from "@/Modules/User/User.interface";
import { User } from "@/Modules/User/User.model";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

export const authorize = (...allowedRoles: TUserRoles[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        throw new AppError("Token not found", httpStatus.UNAUTHORIZED);

      // Extract token from "Bearer <token>" format
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7) // Remove "Bearer " prefix
        : authHeader;

      if (!token)
        throw new AppError("Token format invalid", httpStatus.UNAUTHORIZED);

      const decoded = verifyToken(
        token,
        ENV.JWT_ACCESS_SECRET_KEY,
      ) as IJwtPayload;

      const user = await User.findOne({ email: decoded.email });
      if (!user) throw new AppError("User not found", httpStatus.NOT_FOUND);

      // Only check if user is active
      if (!user.isActive) {
        throw new AppError("User is not active", httpStatus.FORBIDDEN);
      }

      // Role check
      if (
        allowedRoles.length &&
        !allowedRoles.includes(decoded.role as TUserRoles)
      ) {
        throw new AppError(
          "Access denied: insufficient permissions",
          httpStatus.FORBIDDEN,
        );
      }

      req.user = decoded;
      next();
    } catch (err) {
      next(err);
    }
  };
};
