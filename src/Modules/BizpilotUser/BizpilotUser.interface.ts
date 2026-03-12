import { Types } from "mongoose";

export interface IBizpilotUser {
  name?: string;
  createdBy?: Types.ObjectId;
  invitedBy?: Types.ObjectId;
  email: string;
  password?: string;
  phone?: string;
  image?: string;
  isEmailVerified: boolean;
  isActive: boolean;
}
