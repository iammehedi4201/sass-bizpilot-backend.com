import { z } from "zod";

export const getAllBizpilotUsersSchema = z.object({
  query: z.object({
    filter: z
      .enum(["active", "archived", "invited"], {
        message: "Filter must be active, archived, or invited",
      })
      .optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const archiveBizpilotUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
  body: z.object({
    isActive: z.boolean({ message: "isActive (boolean) is required" }),
  }),
});
