import { ENV } from "@/config";
import { AppError } from "@/helper/errorHelper/appError";
import { AuthorizationError } from "@/helper/errorHelper/AuthorizationError";
import { generateToken } from "@/helper/jwtHelper";
import httpStatus from "http-status";
import { SortOrder } from "mongoose";
import { sendModeratorInvitationEmail } from "../../helper/emailHelper/sendModeratorInvitationEmail";
import { TModeratorLevel } from "./Moderator.constant";
import { IModeratorJwtPayload } from "./Moderator.interface";
import { Moderator } from "./Moderator.model";
import { ModeratorInvite } from "./ModeratorInvite.model";

// ── Helpers ──────────────────────────────────────────────────────────
const assertAdminOrSuperAdmin = (moderator: IModeratorJwtPayload) => {
  if (
    moderator.level !== "superAdmin" &&
    moderator.level !== "admin"
  ) {
    throw new AuthorizationError("Only admin or superAdmin can perform this action");
  }
};

const assertSuperAdmin = (moderator: IModeratorJwtPayload) => {
  if (moderator.level !== "superAdmin") {
    throw new AuthorizationError("Only superAdmin can perform this action");
  }
};

// ── Invite Moderator ────────────────────────────────────────────────
const inviteModerator = async (
  email: string,
  requestingModerator: IModeratorJwtPayload,
) => {
  assertAdminOrSuperAdmin(requestingModerator);

  // Check if moderator already exists
  const existingModerator = await Moderator.findOne({ email });
  if (existingModerator) {
    throw new AppError("Moderator already exists with this email", httpStatus.CONFLICT);
  }

  // Remove old invite if exists, then create fresh one
  await ModeratorInvite.deleteOne({ email });

  const moderatorInvite = await ModeratorInvite.create({
    email,
    moderator: requestingModerator.id,
  });

  const token = generateToken(
    { id: moderatorInvite._id.toString(), email: moderatorInvite.email },
    ENV.JWT_ACCESS_SECRET_KEY,
    "7d",
  );

  const link = `${ENV.ADMIN_APP_LINK}auth/register/${token}`;

  await sendModeratorInvitationEmail(email, link);

  return {
    _id: moderatorInvite._id,
    email: moderatorInvite.email,
    token,
  };
};

// ── Get All Moderators ──────────────────────────────────────────────
const getAllModerators = async (status?: string, level?: string) => {
  const filter: Record<string, unknown> = { isActive: true };
  let sortBy: Record<string, SortOrder> = { createdAt: -1 };

  if (level === "admin") {
    filter.level = { $in: ["admin", "superAdmin"] };
  } else if (level) {
    filter.level = level;
  }

  if (status === "archived") {
    filter.isActive = false;
    sortBy = { updatedAt: -1 };
  }

  const moderators = await Moderator.find(filter)
    .select("-password")
    .sort(sortBy);

  return moderators;
};

// ── Get Single Moderator ────────────────────────────────────────────
const getSingleModerator = async (id: string) => {
  const moderator = await Moderator.findById(id).select("-password");
  if (!moderator) {
    throw new AppError("Moderator not found", httpStatus.NOT_FOUND);
  }
  return moderator;
};

// ── Archive / Unarchive Moderator ───────────────────────────────────
const archiveModerator = async (
  id: string,
  isActive: boolean,
  requestingModerator: IModeratorJwtPayload,
) => {
  assertAdminOrSuperAdmin(requestingModerator);

  const moderator = await Moderator.findByIdAndUpdate(
    id,
    { isActive },
    { new: true },
  );

  if (!moderator) {
    throw new AppError("Moderator not found", httpStatus.NOT_FOUND);
  }

  return {
    success: true,
    message: `${isActive ? "Unarchive" : "Archive"} successful`,
  };
};

// ── Change Moderator Level ──────────────────────────────────────────
const changeModeratorLevel = async (
  id: string,
  level: TModeratorLevel,
  requestingModerator: IModeratorJwtPayload,
) => {
  assertSuperAdmin(requestingModerator);

  const moderator = await Moderator.findById(id);
  if (!moderator) {
    throw new AppError("Moderator not found", httpStatus.NOT_FOUND);
  }

  if (!moderator.isActive) {
    throw new AppError("Moderator is not active", httpStatus.BAD_REQUEST);
  }

  moderator.level = level;
  await moderator.save();

  return {
    success: true,
    message: `Role changed to ${level === "admin" ? "admin" : "moderator"}`,
  };
};

// ── Get All Moderator Invites ───────────────────────────────────────
const getAllModeratorInvites = async (
  requestingModerator: IModeratorJwtPayload,
) => {
  assertAdminOrSuperAdmin(requestingModerator);

  const invites = await ModeratorInvite.find({ isActive: true })
    .populate({ path: "moderator", select: "-password" })
    .sort({ createdAt: -1 });

  return invites;
};

// ── Get Single Moderator Invite ─────────────────────────────────────
const getSingleModeratorInvite = async (
  id: string,
  requestingModerator: IModeratorJwtPayload,
) => {
  assertAdminOrSuperAdmin(requestingModerator);

  const invite = await ModeratorInvite.findById(id).populate("moderator");
  if (!invite) {
    throw new AppError("Moderator invite not found", httpStatus.NOT_FOUND);
  }
  return invite;
};

// ── Delete Moderator Invite ─────────────────────────────────────────
const deleteModeratorInvite = async (
  id: string,
  requestingModerator: IModeratorJwtPayload,
) => {
  assertAdminOrSuperAdmin(requestingModerator);

  const invite = await ModeratorInvite.findById(id);
  if (!invite) {
    throw new AppError("Invite not found", httpStatus.NOT_FOUND);
  }

  await ModeratorInvite.findByIdAndDelete(id);

  return { success: true, message: "Successfully deleted" };
};

export const ModeratorService = {
  inviteModerator,
  getAllModerators,
  getSingleModerator,
  archiveModerator,
  changeModeratorLevel,
  getAllModeratorInvites,
  getSingleModeratorInvite,
  deleteModeratorInvite,
};
