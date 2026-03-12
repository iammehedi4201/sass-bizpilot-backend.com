import { moderatorAuthorize } from "@/middlewares/common/moderatorAuthorize.middlewares";
import ValidateRequest from "@/middlewares/common/ValidationRequest";
import { Router } from "express";
import { OrganizationMemberController } from "./OrganizationMember.controller";
import {
  archiveOrganizationMemberSchema,
  createOrganizationMemberSchema,
  getSingleOrganizationAllMembersSchema,
  inviteOrganizationMemberSchema,
  orgMemberIdParamSchema,
} from "./OrganizationMember.validation";

const router = Router();

//! Create OrganizationMember (public — invited user clicks email link and registers)
router.post(
  "/createOrganizationMember",
  ValidateRequest(createOrganizationMemberSchema),
  OrganizationMemberController.createOrganizationMember,
);

// ── Protected routes (require authenticated moderator) ───────────────────────
router.use(moderatorAuthorize());

//! Invite OrganizationMember (sends invitation email)
router.post(
  "/inviteOrganizationMember",
  ValidateRequest(inviteOrganizationMemberSchema),
  OrganizationMemberController.inviteOrganizationMember,
);

//! Get Single Organization's All Members
router.get(
  "/",
  ValidateRequest(getSingleOrganizationAllMembersSchema),
  OrganizationMemberController.getSingleOrganizationAllMembers,
);

//! Get Single OrganizationMember
router.get(
  "/getSingleOrganizationMember/:id",
  ValidateRequest(orgMemberIdParamSchema),
  OrganizationMemberController.getSingleOrganizationMember,
);

//! Archive / Unarchive OrganizationMember
router.patch(
  "/archiveOrganizationMember/:id",
  ValidateRequest(archiveOrganizationMemberSchema),
  OrganizationMemberController.archiveOrganizationMember,
);

export const OrganizationMemberRoutes = router;
