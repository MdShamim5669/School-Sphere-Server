import express from "express";
import auth from "../../middlewares/auth.js";
import { upload } from "../../middlewares/upload.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { StudentController } from "./student.controller.js";
import { StudentValidation } from "./student.validation.js";

const router = express.Router();

router.post(
  "/",
  auth("ADMIN"),
  validateRequest(StudentValidation.createStudentZodSchema),
  StudentController.createStudent
);

router.get("/", auth("ADMIN", "TEACHER"), StudentController.getAllStudents);

router.get(
  "/:id",
  auth("ADMIN", "TEACHER", "PARENT", "STUDENT"),
  StudentController.getStudentById
);

router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(StudentValidation.updateStudentZodSchema),
  StudentController.updateStudent
);

router.delete("/:id", auth("ADMIN"), StudentController.deleteStudent);

router.post(
  "/:id/image",
  auth("ADMIN"),
  upload.single("image"),
  StudentController.uploadStudentImage
);

router.delete(
  "/:id/image",
  auth("ADMIN"),
  StudentController.removeStudentImage
);

export const StudentRoutes = router;
