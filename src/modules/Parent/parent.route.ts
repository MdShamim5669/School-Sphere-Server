import express from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { ParentController } from "./parent.controller.js";
import { ParentValidation } from "./parent.validation.js";

const router = express.Router();

router.post(
  "/",
  auth("ADMIN"),
  validateRequest(ParentValidation.createParentZodSchema),
  ParentController.createParent
);

router.get("/", auth("ADMIN"), ParentController.getAllParents);

router.get(
  "/:id",
  auth("ADMIN", "PARENT"),
  ParentController.getParentById
);

router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(ParentValidation.updateParentZodSchema),
  ParentController.updateParent
);

router.delete("/:id", auth("ADMIN"), ParentController.deleteParent);

export const ParentRoutes = router;
