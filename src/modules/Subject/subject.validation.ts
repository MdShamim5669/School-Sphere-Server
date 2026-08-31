import { z } from "zod";

const createSubjectZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Subject name is required" }),
    teacherIds: z.array(z.string()).optional(),
  }),
});

const updateSubjectZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    teacherIds: z.array(z.string()).optional(),
  }),
});

export const SubjectValidation = {
  createSubjectZodSchema,
  updateSubjectZodSchema,
};
