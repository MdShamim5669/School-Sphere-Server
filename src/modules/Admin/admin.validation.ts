import { z } from "zod";

const createAdminZodSchema = z.object({
  body: z.object({
    username: z.string({ required_error: "Username is required" }),
    password: z.string({ required_error: "Password is required" }).min(6),
  }),
});

export const AdminValidation = {
  createAdminZodSchema,
};
