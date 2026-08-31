import express from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { AttendanceController } from "./attendance.controller.js";
import { AttendanceValidation } from "./attendance.validation.js";

const router = express.Router();

router.post(
  "/",
  auth("ADMIN", "TEACHER"),
  validateRequest(AttendanceValidation.createAttendanceZodSchema),
  AttendanceController.markAttendance
);

router.get(
  "/",
  auth("ADMIN", "TEACHER", "PARENT", "STUDENT"),
  AttendanceController.getAttendanceRecords
);

router.patch(
  "/:id",
  auth("ADMIN", "TEACHER"),
  validateRequest(AttendanceValidation.updateAttendanceZodSchema),
  AttendanceController.updateAttendance
);

export const AttendanceRoutes = router;
