import { ENV } from "@/config";
import { userRoles } from "@/constants";
import { sendOTPEmail } from "@/helper/emailHelper/sendOTPEmail";
import { sendPasswordResetEmail } from "@/helper/emailHelper/sendPasswordResetEmail";
import { sendVerificationEmail } from "@/helper/emailHelper/sendVerificationEmail";
import { AppError } from "@/helper/errorHelper/appError";
import { generateToken, verifyToken } from "@/helper/jwtHelper";
import { randomInt } from "crypto";
import { EmailVerification } from "../EmailVerification/EmailVerification.model";
import { IUser } from "../User/User.interface";
import { User } from "../User/User.model";
import { hashPassword } from "./../../helper/password.helper";

//! Register Customer Service
const registerUserToDB = async (payLoad: IUser) => {
  const { name, email, password } = payLoad;

  // Check if user already exists
  const isUserExists = await User.findOne({ email });
  if (isUserExists) {
    throw new AppError("Customer already exists", 400);
  }

  // Hash the password
  const hashedPassword = await hashPassword(password);

  // Create the user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: userRoles.User, // assuming userRoles.User is the correct enum value
  });

  // Generate Magic Link JWT for email verification
  const magicToken = generateToken(
    {
      id: user._id,
      email: user.email,
    },
    ENV.EMAIL_VERIFICATION_SECRET,
    "15min",
  );

  // Send verification email
  await sendVerificationEmail(email, magicToken);

  return {
    user,
    hasVerificationEmailBeenSent: true,
  };
};
//! Login Service
const loginToDB = async (payLoad: { email: string; password: string }) => {
  const { email, password } = payLoad;

  const user = await User.findOne({ email, isActive: true });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isPasswordValid = await User.isPasswordCorrect(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  // Generate tokens AFTER transaction (doesn't need DB lock)
  const payload = { id: user._id, email: user.email, role: user.role };

  const accessToken = generateToken(payload, ENV.JWT_ACCESS_SECRET_KEY, "7d");
  const refreshToken = generateToken(payload, ENV.JWT_REFRESH_SECRET_KEY, "7d");

  return {
    user,
    accessToken,
    refreshToken,
  };
};

//! Verify Email Service
const verifyEmail = async (token: string) => {
  if (!token) {
    throw new AppError("token is required", 400);
  }

  const decoded = verifyToken(token, ENV.EMAIL_VERIFICATION_SECRET);

  const user = await User.findOne({
    _id: decoded.id,
    email: decoded.email,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Generate tokens
  const accessToken = generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    ENV.JWT_ACCESS_SECRET_KEY,
    "15m",
  );

  const refreshToken = generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    ENV.JWT_REFRESH_SECRET_KEY,
    "7d",
  );

  // 4. Mark as verified ONLY if not already
  const alreadyVerified = user.isVerified;
  if (!alreadyVerified) {
    user.isVerified = true;
    await user.save();
  }

  return {
    accessToken,
    refreshToken,
  };
};

//! Send OTP Service
const sendOTP = async (email: string) => {
  const user = await User.findOne({ email, isVerified: false });
  if (!user) throw new AppError("User not found or already verified", 404);

  const recentOTP = await EmailVerification.findOne({
    email,
    createdAt: { $gt: new Date(Date.now() - 60 * 1000) }, // 1 min cooldown
  });

  if (recentOTP) {
    throw new AppError("Please wait 1 minute before requesting a new OTP", 429);
  }

  // Revoke old OTPs
  await EmailVerification.deleteMany({ userId: user._id, used: false });

  // Use crypto.randomInt for secure OTP generation
  const code = randomInt(100000, 1000000).toString(); // 6-digit
  const hashed = await hashPassword(code);

  await EmailVerification.create({
    userId: user._id,
    email,
    code: hashed,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
  });

  await sendOTPEmail(email, code);
  return { message: "OTP sent to email" };
};

//! Verify OTP Service
const verifyOTPCode = async (email: string, code: string) => {
  const record = await EmailVerification.findOne({
    email,
    used: false,
    expiresAt: { $gt: new Date() }, // ← CRITICAL: Check expiry
  });

  if (!record) throw new AppError("Invalid or expired code", 400);

  // Check attempts (fail fast)
  if (record.attempts >= 3) {
    // Mark as used to ensure it's not attempted further
    await EmailVerification.updateOne({ _id: record._id }, { used: true });
    throw new AppError("Too many failed attempts. Request a new OTP.", 429);
  }

  // Validate code
  if (!(await record.isValidCode(code))) {
    // Increment attempts atomically
    const updated = await EmailVerification.findByIdAndUpdate(
      record._id,
      { $inc: { attempts: 1 } },
      { new: true },
    );

    if (updated && updated.attempts >= 3) {
      // Lock this OTP after reaching attempt limit
      await EmailVerification.updateOne({ _id: record._id }, { used: true });
      throw new AppError("Too many failed attempts. Request a new OTP.", 429);
    }

    throw new AppError("Incorrect code", 400);
  }

  // Mark OTP as used atomically to prevent reuse/race conditions
  await EmailVerification.findOneAndUpdate(
    { _id: record._id, used: false },
    { $set: { used: true } },
  );

  const user = await User.findByIdAndUpdate(
    record.userId,
    { isVerified: true },
    { new: true },
  );

  if (!user) throw new AppError("User not found", 404);

  // Generate tokens AFTER transaction/verification
  const accessToken = generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    ENV.JWT_ACCESS_SECRET_KEY,
    "15m",
  );

  const refreshToken = generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    ENV.JWT_REFRESH_SECRET_KEY,
    "7d",
  );

  return { accessToken, refreshToken };
};

//! Refresh Token Service
const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  // Verify refresh token
  const decoded = verifyToken(refreshToken, ENV.JWT_REFRESH_SECRET_KEY);

  // Find user and verify they still exist and are active
  const user = await User.findOne({
    _id: decoded.id,
    email: decoded.email,
    isActive: true,
    isVerified: true,
  });

  if (!user) {
    throw new AppError("User not found or inactive", 404);
  }

  // Generate new access token
  const accessToken = generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    ENV.JWT_ACCESS_SECRET_KEY,
    "15m",
  );

  return {
    accessToken,
  };
};

//! Forgot Password Service
const forgotPassword = async (email: string) => {
  // Find user by email
  const user = await User.findOne({ email, isActive: true });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Generate password reset token
  const resetToken = generateToken(
    {
      id: user._id,
      email: user.email,
      purpose: "password-reset",
    },
    ENV.PASSWORD_RESET_SECRET,
    "15min",
  );

  // Send password reset email
  await sendPasswordResetEmail(email, resetToken);

  return {
    message: "password reset link has been sent.",
  };
};

//! Reset Password Service
const resetPassword = async (token: string, newPassword: string) => {
  // Verify reset token
  const decoded = verifyToken(token, ENV.PASSWORD_RESET_SECRET);

  // Validate token purpose
  if (decoded.purpose !== "password-reset") {
    throw new AppError("Invalid token", 401);
  }

  // Find user
  const user = await User.findOne({
    _id: decoded.id,
    email: decoded.email,
    isActive: true,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  user.password = hashedPassword;
  await user.save();

  // Invalidate all existing sessions (optional but recommended)
  // You might want to implement a token blacklist or version system

  return {
    message:
      "Password reset successfully. Please login with your new password.",
  };
};

export const AuthService = {
  registerUserToDB,
  loginToDB,
  verifyEmail,
  sendOTP,
  verifyOTPCode,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
};
