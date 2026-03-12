import { CallbackError, model, Schema } from "mongoose";
import { IBizpilotUser } from "./BizpilotUser.interface";

const BizpilotUserSchema = new Schema<IBizpilotUser>(
  {
    name: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "BizpilotUser",
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "Moderator",
    },
    email: {
      type: String,
      required: [true, "Please add email"],
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
    },
    image: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false },
);

// Exactly one of createdBy or invitedBy must be present.
BizpilotUserSchema.pre("validate", function (next) {
  if (!this.createdBy && !this.invitedBy) {
    return next(
      new Error(
        "Either createdBy or invitedBy must be present.",
      ) as CallbackError,
    );
  }
  if (this.createdBy && this.invitedBy) {
    return next(
      new Error(
        "Only one of createdBy or invitedBy can be present.",
      ) as CallbackError,
    );
  }
  next();
});

export const BizpilotUser = model<IBizpilotUser>(
  "BizpilotUser",
  BizpilotUserSchema,
);
