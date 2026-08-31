import express from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { SubjectController } from "./subject.controller.js";
import { SubjectValidation } from "./subject.validation.js";

const router = express.Router();

router.post(
  "/",
  auth("ADMIN"),
  validateRequest(SubjectValidation.createSubjectZodSchema),
  SubjectController.createSubject
);

router.get(
  "/",
  auth("ADMIN", "TEACHER", "PARENT", "STUDENT"),
  SubjectController.getAllSubjects
);

router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(SubjectValidation.updateSubjectZodSchema),
  SubjectController.updateSubject
);

router.delete("/:id", auth("ADMIN"), SubjectController.deleteSubject);

export const SubjectRoutes = router;
