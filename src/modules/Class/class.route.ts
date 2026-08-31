import express from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { ClassController } from "./class.controller.js";
import { ClassValidation } from "./class.validation.js";

const router = express.Router();

router.post(
  "/",
  auth("ADMIN"),
  validateRequest(ClassValidation.createClassZodSchema),
  ClassController.createClass
);

router.get(
  "/",
  auth("ADMIN", "TEACHER", "PARENT", "STUDENT"),
  ClassController.getAllClasses
);

router.get(
  "/:id",
  auth("ADMIN", "TEACHER", "PARENT", "STUDENT"),
  ClassController.getClassById
);

router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(ClassValidation.updateClassZodSchema),
  ClassController.updateClass
);

router.delete("/:id", auth("ADMIN"), ClassController.deleteClass);

export const ClassRoutes = router;
