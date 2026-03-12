import { ENV } from "@/config";
import { AppError } from "@/helper/errorHelper/appError";
import { generateToken, verifyToken } from "@/helper/jwtHelper";
import { hashPassword } from "@/helper/password.helper";
import { sendOrganizationMemberInvitationEmail } from "@/helper/emailHelper/sendOrganizationMemberInvitationEmail";
import { BizpilotUser } from "@/Modules/BizpilotUser/BizpilotUser.model";
import { performDBTransaction } from "@/Utils/performDBTransaction";
import httpStatus from "http-status";
import { IModeratorJwtPayload } from "../Moderator/Moderator.interface";
import { Organization } from "./Organization.model";
import { OrganizationMember } from "./OrganizationMember.model";
import { TOrgMemberLevel } from "./Organization.constant";

// ── Invite OrganizationMember ────────────────────────────────────────────────
// Only validates and sends invitation email. No records created yet.
const inviteOrganizationMember = async (
  email: string,
  organizationId: string,
  level: TOrgMemberLevel = "member",
  moderator: IModeratorJwtPayload,
) => {
  const org = await Organization.findById(organizationId);
  if (!org) throw new AppError("Organization not found", httpStatus.NOT_FOUND);
  if (!org.isActive)
    throw new AppError("Organization is not active", httpStatus.BAD_REQUEST);

  // Check if this email is already a member of this org.
  const existingUser = await BizpilotUser.findOne({ email });
  if (existingUser) {
    const existingMember = await OrganizationMember.findOne({
      bizpilotUser: existingUser._id,
      organization: organizationId,
    });
    if (existingMember)
      throw new AppError(
        "User is already a member of this organization",
        httpStatus.CONFLICT,
      );
  }

  // Encode invitation details in the token.
  const token = generateToken(
    {
      email,
      organizationId,
      level,
      invitedBy: moderator.id,
    },
    ENV.JWT_ACCESS_SECRET_KEY,
    "30d",
  );

  const link = `${ENV.BIZPILOT_APP_LINK}auth/register/${token}`;
  await sendOrganizationMemberInvitationEmail(email, link);

  return { email, organizationId, level };
};

// ── Create OrganizationMember ────────────────────────────────────────────────
// Called when the invited user clicks the link and registers.
// Verifies token, creates BizpilotUser (if new) + OrganizationMember.
const createOrganizationMember = async (
  token: string,
  name: string,
  password: string,
) => {
  const decoded = verifyToken(token, ENV.JWT_ACCESS_SECRET_KEY);

  const { email, organizationId, level, invitedBy } = decoded as {
    email: string;
    organizationId: string;
    level: TOrgMemberLevel;
    invitedBy: string;
  };

  if (!email || !organizationId || !invitedBy)
    throw new AppError("Invalid invitation token", httpStatus.BAD_REQUEST);

  const org = await Organization.findById(organizationId);
  if (!org) throw new AppError("Organization not found", httpStatus.NOT_FOUND);
  if (!org.isActive)
    throw new AppError("Organization is no longer active", httpStatus.BAD_REQUEST);

  const hashedPassword = await hashPassword(password);

  const result = await performDBTransaction(async (session) => {
    // Find or create BizpilotUser.
    let bizpilotUser = await BizpilotUser.findOne({ email });

    if (bizpilotUser) {
      // Check not already a member of this org.
      const existingMember = await OrganizationMember.findOne({
        bizpilotUser: bizpilotUser._id,
        organization: organizationId,
      });
      if (existingMember)
        throw new AppError(
          "User is already a member of this organization",
          httpStatus.CONFLICT,
        );

      // Update user details if registering for the first time.
      if (!bizpilotUser.isEmailVerified) {
        bizpilotUser.name = name;
        bizpilotUser.password = hashedPassword;
        bizpilotUser.isEmailVerified = true;
        await bizpilotUser.save({ session });
      }
    } else {
      [bizpilotUser] = await BizpilotUser.create(
        [
          {
            email,
            name,
            password: hashedPassword,
            invitedBy,
            isEmailVerified: true,
          },
        ],
        { session },
      );
    }

    const [orgMember] = await OrganizationMember.create(
      [
        {
          bizpilotUser: bizpilotUser._id,
          organization: organizationId,
          level: level || "member",
          isActive: true,
          isRegistered: true,
        },
      ],
      { session },
    );

    return { bizpilotUser, orgMember };
  });

  return result;
};

// ── Get Single Organization All Members ──────────────────────────────────────
const getSingleOrganizationAllMembers = async (
  organizationId: string,
  filter?: string,
) => {
  const query: Record<string, unknown> = { organization: organizationId };

  if (filter === "active") query.isActive = true;
  else if (filter === "archive") query.isActive = false;

  return OrganizationMember.find(query)
    .populate("bizpilotUser", "name email image isEmailVerified isActive")
    .populate("organization", "name logo currency");
};

// ── Get Single OrganizationMember ────────────────────────────────────────────
const getSingleOrganizationMember = async (id: string) => {
  const member = await OrganizationMember.findById(id)
    .populate("bizpilotUser", "name email image isEmailVerified isActive")
    .populate("organization", "name logo currency");

  if (!member)
    throw new AppError("Organization member not found", httpStatus.NOT_FOUND);
  return member;
};

// ── Archive / Unarchive OrganizationMember ───────────────────────────────────
const archiveOrganizationMember = async (id: string, isActive: boolean) => {
  const member = await OrganizationMember.findById(id);
  if (!member)
    throw new AppError("Organization member not found", httpStatus.NOT_FOUND);

  return OrganizationMember.findByIdAndUpdate(id, { isActive }, { new: true });
};

export const OrganizationMemberService = {
  inviteOrganizationMember,
  createOrganizationMember,
  getSingleOrganizationAllMembers,
  getSingleOrganizationMember,
  archiveOrganizationMember,
};
