import { z } from "zod";

const createAttendanceZodSchema = z.object({
  body: z.object({
    date: z.string({ required_error: "Date is required" }),
    present: z.boolean({ required_error: "Present status is required" }),
    studentId: z.string({ required_error: "Student ID is required" }),
    lessonId: z.string({ required_error: "Lesson ID is required" }),
  }),
});

const updateAttendanceZodSchema = z.object({
  body: z.object({
    present: z.boolean({ required_error: "Present status is required" }),
  }),
});

export const AttendanceValidation = {
  createAttendanceZodSchema,
  updateAttendanceZodSchema,
};
