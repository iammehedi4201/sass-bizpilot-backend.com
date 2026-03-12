import { moderatorAuthorize } from "@/middlewares/common/moderatorAuthorize.middlewares";
import ValidateRequest from "@/middlewares/common/ValidationRequest";
import { Router } from "express";
import { BizpilotUserController } from "./BizpilotUser.controller";
import {
  archiveBizpilotUserSchema,
  getAllBizpilotUsersSchema,
} from "./BizpilotUser.validation";

const router = Router();

// All routes require an authenticated moderator.
router.use(moderatorAuthorize());

//! Get All BizpilotUsers
router.get(
  "/",
  ValidateRequest(getAllBizpilotUsersSchema),
  BizpilotUserController.getAllBizpilotUsers,
);

//! Archive / Unarchive BizpilotUser (cascades to OrganizationMember)
router.patch(
  "/archiveBizpilotUser/:id",
  ValidateRequest(archiveBizpilotUserSchema),
  BizpilotUserController.archiveBizpilotUser,
);

export const BizpilotUserRoutes = router;
