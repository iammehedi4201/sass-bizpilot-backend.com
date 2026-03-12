import { ENV } from "@/config";
import { AppError } from "@/helper/errorHelper/appError";
import { verifyToken } from "@/helper/jwtHelper";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { TModeratorLevel } from "../../Modules/Moderator/Moderator.constant";
import { IModeratorJwtPayload } from "../../Modules/Moderator/Moderator.interface";
import { Moderator } from "../../Modules/Moderator/Moderator.model";

/**
 * Middleware that authenticates a moderator via JWT and optionally
 * restricts access to the specified levels.
 */
export const moderatorAuthorize = (...allowedLevels: TModeratorLevel[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new AppError("Token not found", httpStatus.UNAUTHORIZED);
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : authHeader;

      if (!token) {
        throw new AppError("Token format invalid", httpStatus.UNAUTHORIZED);
      }

      const decoded = verifyToken(
        token,
        ENV.JWT_ACCESS_SECRET_KEY,
      ) as IModeratorJwtPayload;

      const moderator = await Moderator.findOne({ email: decoded.email });

      if (!moderator) {
        throw new AppError("Moderator not found", httpStatus.NOT_FOUND);
      }

      if (!moderator.isActive) {
        throw new AppError("Moderator is not active", httpStatus.FORBIDDEN);
      }

      if (
        allowedLevels.length &&
        !allowedLevels.includes(moderator.level as TModeratorLevel)
      ) {
        throw new AppError(
          "Access denied: insufficient permissions",
          httpStatus.FORBIDDEN,
        );
      }

      req.moderator = {
        id: moderator._id.toString(),
        email: moderator.email,
        level: moderator.level as TModeratorLevel,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
};
