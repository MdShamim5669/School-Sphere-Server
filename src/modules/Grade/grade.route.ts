import express from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { GradeController } from "./grade.controller.js";
import { GradeValidation } from "./grade.validation.js";

const router = express.Router();

router.post(
  "/",
  auth("ADMIN"),
  validateRequest(GradeValidation.createGradeZodSchema),
  GradeController.createGrade
);

router.get(
  "/",
  auth("ADMIN", "TEACHER", "PARENT", "STUDENT"),
  GradeController.getAllGrades
);

router.get(
  "/:id",
  auth("ADMIN", "TEACHER", "PARENT", "STUDENT"),
  GradeController.getGradeById
);

router.patch(
  "/:id",
  auth("ADMIN"),
  GradeController.updateGrade
);

router.delete(
  "/:id",
  auth("ADMIN"),
  GradeController.deleteGrade
);

export const GradeRoutes = router;
