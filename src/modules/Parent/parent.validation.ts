import { z } from "zod";

const createParentZodSchema = z.object({
  body: z.object({
    username: z.string({ required_error: "Username is required" }),
    password: z.string({ required_error: "Password is required" }).min(6),
    name: z.string({ required_error: "Name is required" }),
    surname: z.string({ required_error: "Surname is required" }),
    email: z.string().email().optional(),
    phone: z.string({ required_error: "Phone number is required" }),
    address: z.string({ required_error: "Address is required" }),
  }),
});

const updateParentZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    surname: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const ParentValidation = {
  createParentZodSchema,
  updateParentZodSchema,
};
