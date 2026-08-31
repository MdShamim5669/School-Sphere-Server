import express from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { ExamController } from "./exam.controller.js";
import { ExamValidation } from "./exam.validation.js";

const router = express.Router();

router.post(
  "/",
  auth("ADMIN", "TEACHER"),
  validateRequest(ExamValidation.createExamZodSchema),
  ExamController.createExam
);

router.get(
  "/",
  auth("ADMIN", "TEACHER", "PARENT", "STUDENT"),
  ExamController.getAllExams
);

router.patch(
  "/:id",
  auth("ADMIN", "TEACHER"),
  validateRequest(ExamValidation.updateExamZodSchema),
  ExamController.updateExam
);

router.delete("/:id", auth("ADMIN", "TEACHER"), ExamController.deleteExam);

export const ExamRoutes = router;
