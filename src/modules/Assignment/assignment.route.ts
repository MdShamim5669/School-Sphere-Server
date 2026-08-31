import express from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { AssignmentController } from "./assignment.controller.js";
import { AssignmentValidation } from "./assignment.validation.js";

const router = express.Router();

router.post(
  "/",
  auth("ADMIN", "TEACHER"),
  validateRequest(AssignmentValidation.createAssignmentZodSchema),
  AssignmentController.createAssignment
);

router.get(
  "/",
  auth("ADMIN", "TEACHER", "PARENT", "STUDENT"),
  AssignmentController.getAllAssignments
);

router.patch(
  "/:id",
  auth("ADMIN", "TEACHER"),
  validateRequest(AssignmentValidation.updateAssignmentZodSchema),
  AssignmentController.updateAssignment
);

router.delete(
  "/:id",
  auth("ADMIN", "TEACHER"),
  AssignmentController.deleteAssignment
);

export const AssignmentRoutes = router;
