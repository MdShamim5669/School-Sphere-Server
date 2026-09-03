import express from "express";
import auth from "../../middlewares/auth.js";
import { upload } from "../../middlewares/upload.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { EventController } from "./event.controller.js";
import { EventValidation } from "./event.validation.js";

const router = express.Router();

router.post(
  "/",
  auth("ADMIN", "TEACHER"),
  validateRequest(EventValidation.createEventZodSchema),
  EventController.createEvent
);

router.get(
  "/",
  auth("ADMIN", "TEACHER", "PARENT", "STUDENT"),
  EventController.getAllEvents
);

router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(EventValidation.updateEventZodSchema),
  EventController.updateEvent
);

router.delete("/:id", auth("ADMIN"), EventController.deleteEvent);

router.post(
  "/:id/image",
  auth("ADMIN"),
  upload.single("image"),
  EventController.uploadEventImage
);

router.delete(
  "/:id/image",
  auth("ADMIN"),
  EventController.removeEventImage
);

export const EventRoutes = router;
