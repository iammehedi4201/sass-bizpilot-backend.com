import { model, Schema } from "mongoose";
import { OrgMemberLevels } from "./Organization.constant";
import { IOrganizationMember } from "./Organization.interface";

const OrganizationMemberSchema = new Schema<IOrganizationMember>(
  {
    bizpilotUser: {
      type: Schema.Types.ObjectId,
      ref: "BizpilotUser",
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    level: {
      type: String,
      required: [true, "Level is required"],
      enum: {
        values: OrgMemberLevels,
        message: "Please select a valid level",
      },
      default: "member",
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

export const OrganizationMember = model<IOrganizationMember>(
  "OrganizationMember",
  OrganizationMemberSchema,
);
