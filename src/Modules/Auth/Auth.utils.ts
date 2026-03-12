// ...existing code...
import { ENV } from "@/config";
import * as jwt from "jsonwebtoken";
import { IJwtPayload } from "../User/User.interface";

const CreateAccessToken = async (payLoad: IJwtPayload): Promise<string> => {
  return jwt.sign(
    payLoad as jwt.JwtPayload,
    ENV.JWT_ACCESS_SECRET_KEY as jwt.Secret,
    {
      expiresIn: ENV.ACCESS_TOKEN_EXPIERY,
    } as jwt.SignOptions,
  );
};

export default CreateAccessToken;
