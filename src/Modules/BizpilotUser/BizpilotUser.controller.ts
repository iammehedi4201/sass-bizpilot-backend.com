import CatchAsync from "@/Utils/CatchAsync";
import sendResponse from "@/Utils/SendResponse";
import httpStatus from "http-status";
import { BizpilotUserService } from "./BizpilotUser.service";

const getAllBizpilotUsers = CatchAsync(async (req, res) => {
  const { filter, search, page, limit } = req.query as {
    filter?: string;
    search?: string;
    page?: string;
    limit?: string;
  };

  const result = await BizpilotUserService.getAllBizpilotUsers(
    filter,
    search,
    page ? Number(page) : undefined,
    limit ? Number(limit) : undefined,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "BizpilotUsers fetched successfully",
    data: result.users,
    meta: result.meta,
  });
});

const archiveBizpilotUser = CatchAsync(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body as { isActive: boolean };
  const result = await BizpilotUserService.archiveBizpilotUser(id, isActive);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `BizpilotUser ${isActive ? "unarchived" : "archived"} successfully`,
    data: result,
  });
});

export const BizpilotUserController = {
  getAllBizpilotUsers,
  archiveBizpilotUser,
};
