import { z } from "zod";

const createLessonZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Lesson name is required" }),
    day: z.enum(
      [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ],
      {
        required_error: "Day is required",
      }
    ),
    startTime: z.string({ required_error: "Start time is required" }),
    endTime: z.string({ required_error: "End time is required" }),
    subjectId: z.string({ required_error: "Subject ID is required" }),
    classId: z.string({ required_error: "Class ID is required" }),
    teacherId: z.string({ required_error: "Teacher ID is required" }),
  }),
});

const updateLessonZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    day: z
      .enum([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ])
      .optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    subjectId: z.string().optional(),
    classId: z.string().optional(),
    teacherId: z.string().optional(),
  }),
});

export const LessonValidation = {
  createLessonZodSchema,
  updateLessonZodSchema,
};
