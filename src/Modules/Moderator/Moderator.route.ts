import { moderatorAuthorize } from "@/middlewares/common/moderatorAuthorize.middlewares";
import ValidateRequest from "@/middlewares/common/ValidationRequest";
import { Router } from "express";
import { ModeratorController } from "./Moderator.controller";
import {
  archiveModeratorSchema,
  changeModeratorLevelSchema,
  idParamSchema,
  inviteModeratorSchema,
} from "./Moderator.validation";

const router = Router();

// All routes require an authenticated moderator
router.use(moderatorAuthorize());

//! Get All Moderators
router.get("/getAllModerators", ModeratorController.getAllModerators);

//! Get Single Moderator
router.get(
  "/getSingleModerator/:id",
  ValidateRequest(idParamSchema),
  ModeratorController.getSingleModerator,
);

//! Invite Moderator
router.post(
  "/inviteModerator",
  ValidateRequest(inviteModeratorSchema),
  ModeratorController.inviteModerator,
);

//! Resend Moderator Invite (same handler)
router.post(
  "/resendModeratorInvite",
  ValidateRequest(inviteModeratorSchema),
  ModeratorController.inviteModerator,
);

//! Toggle Archive Moderator
router.patch(
  "/toggleArchiveModerator/:id",
  ValidateRequest(archiveModeratorSchema),
  ModeratorController.archiveModerator,
);

//! Change Moderator Level
router.patch(
  "/changeModeratorLevel/:id",
  ValidateRequest(changeModeratorLevelSchema),
  ModeratorController.changeModeratorLevel,
);

//! Get All Moderator Invites
router.get(
  "/getAllModeratorInvites",
  ModeratorController.getAllModeratorInvites,
);

//! Get Single Moderator Invite
router.get(
  "/getSingleModeratorInvite/:id",
  ValidateRequest(idParamSchema),
  ModeratorController.getSingleModeratorInvite,
);

//! Delete Moderator Invite
router.delete(
  "/deleteModeratorInvite/:id",
  ValidateRequest(idParamSchema),
  ModeratorController.deleteModeratorInvite,
);

export const ModeratorRoutes = router;
