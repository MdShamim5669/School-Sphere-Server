import express from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { AnnouncementController } from "./announcement.controller.js";
import { AnnouncementValidation } from "./announcement.validation.js";

const router = express.Router();

router.post(
  "/",
  auth("ADMIN", "TEACHER"),
  validateRequest(AnnouncementValidation.createAnnouncementZodSchema),
  AnnouncementController.createAnnouncement
);

router.get(
  "/",
  auth("ADMIN", "TEACHER", "PARENT", "STUDENT"),
  AnnouncementController.getAllAnnouncements
);

router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(AnnouncementValidation.updateAnnouncementZodSchema),
  AnnouncementController.updateAnnouncement
);

router.delete(
  "/:id",
  auth("ADMIN"),
  AnnouncementController.deleteAnnouncement
);

export const AnnouncementRoutes = router;
