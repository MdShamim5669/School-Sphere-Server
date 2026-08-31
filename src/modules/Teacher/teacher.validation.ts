import { z } from "zod";

const createTeacherZodSchema = z.object({
  body: z.object({
    username: z.string({ required_error: "Username is required" }),
    password: z.string({ required_error: "Password is required" }).min(6),
    name: z.string({ required_error: "Name is required" }),
    surname: z.string({ required_error: "Surname is required" }),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string({ required_error: "Address is required" }),
    bloodType: z.enum([
      "A_POSITIVE",
      "A_NEGATIVE",
      "B_POSITIVE",
      "B_NEGATIVE",
      "AB_POSITIVE",
      "AB_NEGATIVE",
      "O_POSITIVE",
      "O_NEGATIVE",
    ]),
    sex: z.enum(["MALE", "FEMALE"]),
    birthday: z.string({ required_error: "Birthday is required" }),
    subjectIds: z.array(z.string()).optional(),
  }),
});

const updateTeacherZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    surname: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    bloodType: z
      .enum([
        "A_POSITIVE",
        "A_NEGATIVE",
        "B_POSITIVE",
        "B_NEGATIVE",
        "AB_POSITIVE",
        "AB_NEGATIVE",
        "O_POSITIVE",
        "O_NEGATIVE",
      ])
      .optional(),
    sex: z.enum(["MALE", "FEMALE"]).optional(),
    birthday: z.string().optional(),
    subjectIds: z.array(z.string()).optional(),
  }),
});

export const TeacherValidation = {
  createTeacherZodSchema,
  updateTeacherZodSchema,
};
