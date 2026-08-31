import { z } from "zod";

const createExamZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: "Exam title is required" }),
    startTime: z.string({ required_error: "Start time is required" }),
    endTime: z.string({ required_error: "End time is required" }),
    lessonId: z.string({ required_error: "Lesson ID is required" }),
  }),
});

const updateExamZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    lessonId: z.string().optional(),
  }),
});

export const ExamValidation = {
  createExamZodSchema,
  updateExamZodSchema,
};
