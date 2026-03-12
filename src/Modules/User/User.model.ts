import { UserRoles } from "@/constants";
import { comparePassword } from "@/helper/password.helper";
import { model, Schema } from "mongoose";
import { IUser, UserModel } from "./User.interface";

const UserSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: String,
      required: [true, "Please enter your full name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      trim: true,
      unique: true,
    },
    role: {
      type: String,
      enum: {
        values: UserRoles,
        message: "Please select correct role",
      },
      default: "User",
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
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

//hash password before saving
// UserSchema.pre("save", async function (next) {
//   const user = this as IUser;
//   user.password = await bcrypt.hash(user.password, Number(config.salt_rounds));
//   user.confirmPassword = user?.password;
//   next();
// });

// check if password is correct
UserSchema.static(
  "isPasswordCorrect",
  async function (password: string, hashedPassword: string) {
    return await comparePassword(password, hashedPassword);
  },
);

export const User = model<IUser, UserModel>("User", UserSchema);
