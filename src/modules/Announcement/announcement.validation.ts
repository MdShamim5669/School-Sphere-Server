import { z } from "zod";

const createAnnouncementZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: "Announcement title is required" }),
    description: z.string({
      required_error: "Announcement description is required",
    }),
    date: z.string({ required_error: "Date is required" }),
    classId: z.string().optional(),
  }),
});

const updateAnnouncementZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    date: z.string().optional(),
    classId: z.string().optional(),
  }),
});

export const AnnouncementValidation = {
  createAnnouncementZodSchema,
  updateAnnouncementZodSchema,
};
