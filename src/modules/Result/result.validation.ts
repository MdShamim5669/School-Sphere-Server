import { z } from "zod";

const createResultZodSchema = z
  .object({
    body: z.object({
      score: z.number({ required_error: "Score is required" }).min(0),
      studentId: z.string({ required_error: "Student ID is required" }),
      examId: z.string().optional(),
      assignmentId: z.string().optional(),
    }),
  })
  .refine(
    (data) =>
      (data.body.examId && !data.body.assignmentId) ||
      (!data.body.examId && data.body.assignmentId),
    {
      message:
        "A Result must reference either an exam or an assignment, never both and never neither",
      path: ["body", "examId"],
    }
  );

const updateResultZodSchema = z.object({
  body: z.object({
    score: z.number().min(0).optional(),
  }),
});

export const ResultValidation = {
  createResultZodSchema,
  updateResultZodSchema,
};
