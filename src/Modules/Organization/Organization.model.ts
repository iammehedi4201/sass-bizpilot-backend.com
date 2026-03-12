import { model, Schema } from "mongoose";
import { CurrencyValues } from "./Organization.constant";
import { IOrganization } from "./Organization.interface";

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Moderator",
    },
    logo: {
      type: String,
      required: [true, "Logo is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      enum: {
        values: CurrencyValues,
        message: "Please select a valid currency",
      },
      default: "BDT",
    },
  },
  { timestamps: true, versionKey: false },
);

export const Organization = model<IOrganization>(
  "Organization",
  OrganizationSchema,
);
