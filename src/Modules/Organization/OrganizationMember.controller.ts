import CatchAsync from "@/Utils/CatchAsync";
import sendResponse from "@/Utils/SendResponse";
import httpStatus from "http-status";
import { IModeratorJwtPayload } from "../Moderator/Moderator.interface";
import { OrganizationMemberService } from "./OrganizationMember.service";

const inviteOrganizationMember = CatchAsync(async (req, res) => {
  const { email, organization, level } = req.body;
  const result = await OrganizationMemberService.inviteOrganizationMember(
    email,
    organization,
    level,
    req.moderator as IModeratorJwtPayload,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Invitation sent successfully",
    data: result,
  });
});

const createOrganizationMember = CatchAsync(async (req, res) => {
  const { token, name, password } = req.body;
  const result = await OrganizationMemberService.createOrganizationMember(
    token,
    name,
    password,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Organization member created successfully",
    data: result,
  });
});

const getSingleOrganizationAllMembers = CatchAsync(async (req, res) => {
  const { organization, filter } = req.query as {
    organization: string;
    filter?: string;
  };
  const result =
    await OrganizationMemberService.getSingleOrganizationAllMembers(
      organization,
      filter,
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Organization members fetched successfully",
    data: result,
  });
});

const getSingleOrganizationMember = CatchAsync(async (req, res) => {
  const { id } = req.params;
  const result =
    await OrganizationMemberService.getSingleOrganizationMember(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Organization member fetched successfully",
    data: result,
  });
});

const archiveOrganizationMember = CatchAsync(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body as { isActive: boolean };
  const result = await OrganizationMemberService.archiveOrganizationMember(
    id,
    isActive,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Organization member ${isActive ? "unarchived" : "archived"} successfully`,
    data: result,
  });
});

export const OrganizationMemberController = {
  inviteOrganizationMember,
  createOrganizationMember,
  getSingleOrganizationAllMembers,
  getSingleOrganizationMember,
  archiveOrganizationMember,
};
