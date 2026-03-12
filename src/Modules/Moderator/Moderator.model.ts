import { comparePassword } from "@/helper/password.helper";
import { model, Schema } from "mongoose";
import { ModeratorLevels } from "./Moderator.constant";
import { IModerator, ModeratorModel } from "./Moderator.interface";

const ModeratorSchema = new Schema<IModerator, ModeratorModel>(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    level: {
      type: String,
      enum: {
        values: ModeratorLevels,
        message: "Please select a valid level",
      },
      required: [true, "Please add a level"],
    },
    image: {
      type: String,
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

ModeratorSchema.static(
  "isPasswordCorrect",
  async function (password: string, hashedPassword: string) {
    return await comparePassword(password, hashedPassword);
  },
);

export const Moderator = model<IModerator, ModeratorModel>(
  "Moderator",
  ModeratorSchema,
);
