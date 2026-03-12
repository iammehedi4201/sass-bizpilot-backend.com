import { z } from "zod";

export const inviteModeratorSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

export const archiveModeratorSchema = z.object({
  params: z.object({
    id: z.string({ message: "Moderator ID is required" }).min(1),
  }),
  body: z.object({
    isActive: z.boolean({ message: "isActive is required" }),
  }),
});

export const changeModeratorLevelSchema = z.object({
  params: z.object({
    id: z.string({ message: "Moderator ID is required" }).min(1),
  }),
  body: z.object({
    level: z.enum(["superAdmin", "admin", "moderator"], {
      message: "Level is required",
    }),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});
