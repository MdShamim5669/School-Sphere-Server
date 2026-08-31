import { z } from "zod";

const createClassZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Class name is required" }),
    capacity: z.number({ required_error: "Capacity is required" }).min(1),
    gradeId: z.string({ required_error: "Grade ID is required" }),
    supervisorId: z.string().optional(),
  }),
});

const updateClassZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    capacity: z.number().min(1).optional(),
    gradeId: z.string().optional(),
    supervisorId: z.string().optional(),
  }),
});

export const ClassValidation = {
  createClassZodSchema,
  updateClassZodSchema,
};
