import { z } from "zod";

export const createOrganizationSchema = z.object({
  body: z.object({
    name: z
      .string({ message: "Name is required" })
      .min(1, "Name cannot be empty"),
    currency: z
      .enum(["USD", "BDT"], { message: "Currency must be USD or BDT" })
      .optional(),
  }),
});

export const updateOrganizationSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
  body: z
    .object({
      name: z.string().min(1).optional(),
      currency: z.enum(["USD", "BDT"]).optional(),
    })
    .optional(),
});

export const archiveOrganizationSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
  body: z.object({
    isActive: z.boolean({ message: "isActive (boolean) is required" }),
  }),
});

export const orgIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});
