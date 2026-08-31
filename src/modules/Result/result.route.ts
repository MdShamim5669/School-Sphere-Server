import express from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { ResultController } from "./result.controller.js";
import { ResultValidation } from "./result.validation.js";

const router = express.Router();

router.post(
  "/",
  auth("ADMIN", "TEACHER"),
  validateRequest(ResultValidation.createResultZodSchema),
  ResultController.createResult
);

router.get(
  "/",
  auth("ADMIN", "TEACHER", "PARENT", "STUDENT"),
  ResultController.getResults
);

router.patch(
  "/:id",
  auth("ADMIN", "TEACHER"),
  validateRequest(ResultValidation.updateResultZodSchema),
  ResultController.updateResult
);

router.delete("/:id", auth("ADMIN"), ResultController.deleteResult);

export const ResultRoutes = router;
