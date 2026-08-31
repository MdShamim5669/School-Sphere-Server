import { z } from "zod";

const createGradeZodSchema = z.object({
  body: z.object({
    level: z.number({ required_error: "Grade level is required" }),
  }),
});

export const GradeValidation = {
  createGradeZodSchema,
};
