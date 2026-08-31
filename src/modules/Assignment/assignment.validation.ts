import { z } from "zod";

const createAssignmentZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: "Assignment title is required" }),
    startDate: z.string({ required_error: "Start date is required" }),
    dueDate: z.string({ required_error: "Due date is required" }),
    lessonId: z.string({ required_error: "Lesson ID is required" }),
  }),
});

const updateAssignmentZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    lessonId: z.string().optional(),
  }),
});

export const AssignmentValidation = {
  createAssignmentZodSchema,
  updateAssignmentZodSchema,
};
