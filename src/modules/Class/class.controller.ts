import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import pick from "../../utils/pick.js";
import { ClassService } from "./class.service.js";
import { classFilterableFields } from "./class.constant.js";

const createClass = catchAsync(async (req, res) => {
  const result = await ClassService.createClass(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Class created successfully!",
    data: result,
  });
});

const getAllClasses = catchAsync(async (req, res) => {
  const filters = pick(req.query, classFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await ClassService.getAllClasses(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Classes fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getClassById = catchAsync(async (req, res) => {
  const result = await ClassService.getClassById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Class fetched successfully!",
    data: result,
  });
});

const updateClass = catchAsync(async (req, res) => {
  const result = await ClassService.updateClass(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Class updated successfully!",
    data: result,
  });
});

const deleteClass = catchAsync(async (req, res) => {
  const result = await ClassService.deleteClass(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Class deleted successfully!",
    data: result,
  });
});

export const ClassController = {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
};
