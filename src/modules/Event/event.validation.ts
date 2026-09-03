import { z } from "zod";

const createEventZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: "Event title is required" }),
    description: z.string({ required_error: "Event description is required" }),
    startTime: z.string({ required_error: "Start time is required" }),
    endTime: z.string({ required_error: "End time is required" }),
    img: z.string().optional(),
    classId: z.string().optional(),
  }),
});

const updateEventZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    img: z.string().optional(),
    classId: z.string().optional(),
  }),
});

export const EventValidation = {
  createEventZodSchema,
  updateEventZodSchema,
};
