import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import pick from "../../utils/pick.js";
import { AssignmentService } from "./assignment.service.js";
import { assignmentFilterableFields } from "./assignment.constant.js";

const createAssignment = catchAsync(async (req, res) => {
  const result = await AssignmentService.createAssignment(req.body, req.user);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Assignment created successfully!",
    data: result,
  });
});

const getAllAssignments = catchAsync(async (req, res) => {
  const filters = pick(req.query, assignmentFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await AssignmentService.getAllAssignments(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Assignments fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const updateAssignment = catchAsync(async (req, res) => {
  const result = await AssignmentService.updateAssignment(
    req.params.id,
    req.body,
    req.user
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Assignment updated successfully!",
    data: result,
  });
});

const deleteAssignment = catchAsync(async (req, res) => {
  const result = await AssignmentService.deleteAssignment(req.params.id, req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Assignment deleted successfully!",
    data: result,
  });
});

export const AssignmentController = {
  createAssignment,
  getAllAssignments,
  updateAssignment,
  deleteAssignment,
};
