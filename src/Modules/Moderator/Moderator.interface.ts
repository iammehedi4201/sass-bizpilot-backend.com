import { Model, Types } from "mongoose";
import { TModeratorLevel } from "./Moderator.constant";

export interface IModerator {
  name: string;
  email: string;
  password: string;
  level: TModeratorLevel;
  image?: string;
  isActive: boolean;
}

export interface IModeratorInvite {
  moderator: Types.ObjectId;
  email: string;
  isActive: boolean;
}

export interface IModeratorJwtPayload {
  id: string;
  email: string;
  level: TModeratorLevel;
}

export interface ModeratorModel extends Model<IModerator> {
  isPasswordCorrect(
    password: string,
    hashedPassword: string,
  ): Promise<boolean>;
}
