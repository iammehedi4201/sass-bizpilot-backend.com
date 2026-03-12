import { moderatorAuthorize } from "@/middlewares/common/moderatorAuthorize.middlewares";
import ValidateRequest from "@/middlewares/common/ValidationRequest";
import { Router } from "express";
import multer from "multer";
import { OrganizationController } from "./Organization.controller";
import {
  archiveOrganizationSchema,
  createOrganizationSchema,
  orgIdParamSchema,
  updateOrganizationSchema,
} from "./Organization.validation";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes require an authenticated moderator.
router.use(moderatorAuthorize());

//! Get All Organizations
router.get("/", OrganizationController.getAllOrganizations);

//! Create Organization
router.post(
  "/",
  upload.single("logo"),
  ValidateRequest(createOrganizationSchema),
  OrganizationController.createOrganization,
);

//! Get Single Organization
router.get(
  "/getSingleOrganization/:id",
  ValidateRequest(orgIdParamSchema),
  OrganizationController.getSingleOrganization,
);

//! Update Organization
router.patch(
  "/:id",
  upload.single("logo"),
  ValidateRequest(updateOrganizationSchema),
  OrganizationController.updateOrganization,
);

//! Archive / Unarchive Organization
router.patch(
  "/archiveOrganization/:id",
  ValidateRequest(archiveOrganizationSchema),
  OrganizationController.archiveOrganization,
);

export const OrganizationRoutes = router;
