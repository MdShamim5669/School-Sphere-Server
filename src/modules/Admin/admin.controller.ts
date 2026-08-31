import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { AdminService } from "./admin.service.js";

const createAdmin = catchAsync(async (req, res) => {
  const result = await AdminService.createAdmin(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Admin created successfully!",
    data: result,
  });
});

export const AdminController = {
  createAdmin,
};
