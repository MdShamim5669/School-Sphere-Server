import express from "express";
import auth from "../../middlewares/auth.js";
import { upload } from "../../middlewares/upload.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { TeacherController } from "./teacher.controller.js";
import { TeacherValidation } from "./teacher.validation.js";

const router = express.Router();

router.post(
  "/",
  auth("ADMIN"),
  validateRequest(TeacherValidation.createTeacherZodSchema),
  TeacherController.createTeacher
);

router.get("/", auth("ADMIN"), TeacherController.getAllTeachers);

router.get(
  "/:id",
  auth("ADMIN", "TEACHER"),
  TeacherController.getTeacherById
);

router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(TeacherValidation.updateTeacherZodSchema),
  TeacherController.updateTeacher
);

router.delete("/:id", auth("ADMIN"), TeacherController.deleteTeacher);

router.post(
  "/:id/image",
  auth("ADMIN", "TEACHER"),
  upload.single("image"),
  TeacherController.uploadTeacherImage
);

router.delete(
  "/:id/image",
  auth("ADMIN", "TEACHER"),
  TeacherController.removeTeacherImage
);

export const TeacherRoutes = router;
