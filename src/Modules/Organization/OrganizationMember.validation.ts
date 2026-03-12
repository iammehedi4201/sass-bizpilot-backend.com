import { z } from "zod";

export const inviteOrganizationMemberSchema = z.object({
  body: z.object({
    email: z.string({ message: "Email is required" }).email("Invalid email"),
    organization: z.string({ message: "Organization ID is required" }).min(1),
    level: z
      .enum(["superAdmin", "admin", "member"], {
        message: "Level must be superAdmin, admin, or member",
      })
      .optional(),
  }),
});

export const createOrganizationMemberSchema = z.object({
  body: z.object({
    token: z.string({ message: "Invitation token is required" }).min(1),
    name: z.string({ message: "Name is required" }).min(1, "Name cannot be empty"),
    password: z
      .string({ message: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
  }),
});

export const getSingleOrganizationAllMembersSchema = z.object({
  query: z.object({
    organization: z.string({ message: "Organization query param is required" }).min(1),
    filter: z
      .enum(["active", "archive"], {
        message: "Filter must be active or archive",
      })
      .optional(),
  }),
});

export const orgMemberIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});

export const archiveOrganizationMemberSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
  body: z.object({
    isActive: z.boolean({ message: "isActive (boolean) is required" }),
  }),
});
