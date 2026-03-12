import CatchAsync from "@/Utils/CatchAsync";
import sendResponse from "@/Utils/SendResponse";
import httpStatus from "http-status";
import { AppError } from "@/helper/errorHelper/appError";
import { IModeratorJwtPayload } from "../Moderator/Moderator.interface";
import { OrganizationService } from "./Organization.service";

const createOrganization = CatchAsync(async (req, res) => {
  if (!req.file) throw new AppError("Logo is required", httpStatus.BAD_REQUEST);

  const { name, currency } = req.body;
  const result = await OrganizationService.createOrganization(
    name,
    currency,
    req.file,
    req.moderator as IModeratorJwtPayload,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Organization created successfully",
    data: result,
  });
});

const getAllOrganizations = CatchAsync(async (req, res) => {
  const { filter, search } = req.query as {
    filter?: string;
    search?: string;
  };
  const result = await OrganizationService.getAllOrganizations(filter, search);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Organizations fetched successfully",
    data: result,
  });
});

const getSingleOrganization = CatchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrganizationService.getSingleOrganization(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Organization fetched successfully",
    data: result,
  });
});

const updateOrganization = CatchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrganizationService.updateOrganization(
    id,
    req.body,
    req.file,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Organization updated successfully",
    data: result,
  });
});

const archiveOrganization = CatchAsync(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body as { isActive: boolean };
  const result = await OrganizationService.archiveOrganization(id, isActive);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Organization ${isActive ? "unarchived" : "archived"} successfully`,
    data: result,
  });
});

export const OrganizationController = {
  createOrganization,
  getAllOrganizations,
  getSingleOrganization,
  updateOrganization,
  archiveOrganization,
};
