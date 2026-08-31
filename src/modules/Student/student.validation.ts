import { z } from "zod";

const createStudentZodSchema = z.object({
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
    parentId: z.string({ required_error: "Parent ID is required" }),
    classId: z.string({ required_error: "Class ID is required" }),
    gradeId: z.string({ required_error: "Grade ID is required" }),
  }),
});

const updateStudentZodSchema = z.object({
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
    parentId: z.string().optional(),
    classId: z.string().optional(),
    gradeId: z.string().optional(),
  }),
});

export const StudentValidation = {
  createStudentZodSchema,
  updateStudentZodSchema,
};
