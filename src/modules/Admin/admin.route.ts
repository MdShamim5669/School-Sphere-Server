import express from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { AdminController } from "./admin.controller.js";
import { AdminValidation } from "./admin.validation.js";

const router = express.Router();

router.post(
  "/",
  auth("ADMIN"),
  validateRequest(AdminValidation.createAdminZodSchema),
  AdminController.createAdmin
);

router.get(
  "/",
  auth("ADMIN"),
  AdminController.getAllAdmins
);

router.get(
  "/:id",
  auth("ADMIN"),
  AdminController.getAdminById
);

router.delete(
  "/:id",
  auth("ADMIN"),
  AdminController.deleteAdmin
);

export const AdminRoutes = router;
