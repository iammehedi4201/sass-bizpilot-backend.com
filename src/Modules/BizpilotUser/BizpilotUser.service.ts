import { AppError } from "@/helper/errorHelper/appError";
import { OrganizationMember } from "@/Modules/Organization/OrganizationMember.model";
import httpStatus from "http-status";
import { BizpilotUser } from "./BizpilotUser.model";

// ── Get All BizpilotUsers ────────────────────────────────────────────────────
const getAllBizpilotUsers = async (
  filter?: string,
  search?: string,
  page?: number,
  limit?: number,
) => {
  const query: Record<string, unknown> = {};

  if (filter === "active") {
    query.isActive = true;
    query.isEmailVerified = true;
  } else if (filter === "archived") {
    query.isActive = false;
    query.isEmailVerified = true;
  } else if (filter === "invited") {
    query.isEmailVerified = false;
  }

  if (search) {
    query.$or = [
      { name: { $regex: new RegExp(search, "i") } },
      { email: { $regex: new RegExp(search, "i") } },
    ];
  }

  const pageNum = page && page > 0 ? page : 1;
  const limitNum = limit && limit > 0 ? limit : 13;
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    BizpilotUser.find(query)
      .populate("createdBy", "name email")
      .populate("invitedBy", "email")
      .sort({ name: 1 })
      .collation({ locale: "en", strength: 2 })
      .skip(skip)
      .limit(limitNum),
    BizpilotUser.countDocuments(query),
  ]);

  return {
    users,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

// ── Archive / Unarchive BizpilotUser ─────────────────────────────────────────
// Cascades to OrganizationMember.
const archiveBizpilotUser = async (id: string, isActive: boolean) => {
  const user = await BizpilotUser.findById(id);
  if (!user)
    throw new AppError("BizpilotUser not found", httpStatus.NOT_FOUND);

  await BizpilotUser.findByIdAndUpdate(id, { isActive });
  await OrganizationMember.updateMany({ bizpilotUser: id }, { isActive });

  return BizpilotUser.findById(id);
};

export const BizpilotUserService = {
  getAllBizpilotUsers,
  archiveBizpilotUser,
};
