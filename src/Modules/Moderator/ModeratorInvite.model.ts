import { model, Schema } from "mongoose";
import { IModeratorInvite } from "./Moderator.interface";

const ModeratorInviteSchema = new Schema<IModeratorInvite>(
  {
    moderator: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Moderator",
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ModeratorInvite = model<IModeratorInvite>(
  "ModeratorInvite",
  ModeratorInviteSchema,
);
