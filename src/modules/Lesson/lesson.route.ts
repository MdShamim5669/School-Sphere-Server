import express from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { LessonController } from "./lesson.controller.js";
import { LessonValidation } from "./lesson.validation.js";

const router = express.Router();

router.post(
  "/",
  auth("ADMIN"),
  validateRequest(LessonValidation.createLessonZodSchema),
  LessonController.createLesson
);

router.get(
  "/",
  auth("ADMIN", "TEACHER", "PARENT", "STUDENT"),
  LessonController.getAllLessons
);

router.get(
  "/:id",
  auth("ADMIN", "TEACHER", "PARENT", "STUDENT"),
  LessonController.getLessonById
);

router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(LessonValidation.updateLessonZodSchema),
  LessonController.updateLesson
);

router.delete("/:id", auth("ADMIN"), LessonController.deleteLesson);

export const LessonRoutes = router;
