import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import pick from "../../utils/pick.js";
import { AttendanceService } from "./attendance.service.js";
import { attendanceFilterableFields } from "./attendance.constant.js";

const markAttendance = catchAsync(async (req, res) => {
  const result = await AttendanceService.markAttendance(req.body, req.user);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Attendance marked successfully!",
    data: result,
  });
});

const getAttendanceRecords = catchAsync(async (req, res) => {
  const filters = pick(req.query, attendanceFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await AttendanceService.getAttendanceRecords(filters, options, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Attendance records fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const updateAttendance = catchAsync(async (req, res) => {
  const result = await AttendanceService.updateAttendance(
    req.params.id,
    req.body,
    req.user
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Attendance updated successfully!",
    data: result,
  });
});

export const AttendanceController = {
  markAttendance,
  getAttendanceRecords,
  updateAttendance,
};
