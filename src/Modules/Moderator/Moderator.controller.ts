import CatchAsync from "@/Utils/CatchAsync";
import sendResponse from "@/Utils/SendResponse";
import { IModeratorJwtPayload } from "./Moderator.interface";
import { ModeratorService } from "./Moderator.service";

//! Invite Moderator (also used for resend)
const inviteModerator = CatchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await ModeratorService.inviteModerator(
    email,
    req.moderator as IModeratorJwtPayload,
  );

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Moderator invited successfully",
    data: result,
  });
});

//! Get All Moderators
const getAllModerators = CatchAsync(async (req, res) => {
  const { status, level } = req.query;
  const moderators = await ModeratorService.getAllModerators(
    status as string | undefined,
    level as string | undefined,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Moderators retrieved successfully",
    data: moderators,
  });
});

//! Get Single Moderator
const getSingleModerator = CatchAsync(async (req, res) => {
  const { id } = req.params;
  const moderator = await ModeratorService.getSingleModerator(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Moderator retrieved successfully",
    data: moderator,
  });
});

//! Archive / Unarchive Moderator
const archiveModerator = CatchAsync(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const result = await ModeratorService.archiveModerator(
    id,
    isActive,
    req.moderator as IModeratorJwtPayload,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: result.message,
    data: result,
  });
});

//! Change Moderator Level
const changeModeratorLevel = CatchAsync(async (req, res) => {
  const { id } = req.params;
  const { level } = req.body;
  const result = await ModeratorService.changeModeratorLevel(
    id,
    level,
    req.moderator as IModeratorJwtPayload,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: result.message,
    data: result,
  });
});

//! Get All Moderator Invites
const getAllModeratorInvites = CatchAsync(async (req, res) => {
  const invites = await ModeratorService.getAllModeratorInvites(
    req.moderator as IModeratorJwtPayload,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Moderator invites retrieved successfully",
    data: invites,
  });
});

//! Get Single Moderator Invite
const getSingleModeratorInvite = CatchAsync(async (req, res) => {
  const { id } = req.params;
  const invite = await ModeratorService.getSingleModeratorInvite(
    id,
    req.moderator as IModeratorJwtPayload,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Moderator invite retrieved successfully",
    data: invite,
  });
});

//! Delete Moderator Invite
const deleteModeratorInvite = CatchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ModeratorService.deleteModeratorInvite(
    id,
    req.moderator as IModeratorJwtPayload,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: result.message,
    data: result,
  });
});

export const ModeratorController = {
  inviteModerator,
  getAllModerators,
  getSingleModerator,
  archiveModerator,
  changeModeratorLevel,
  getAllModeratorInvites,
  getSingleModeratorInvite,
  deleteModeratorInvite,
};
