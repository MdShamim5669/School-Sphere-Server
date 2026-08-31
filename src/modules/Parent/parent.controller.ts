import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import pick from "../../utils/pick.js";
import { ParentService } from "./parent.service.js";
import { parentFilterableFields } from "./parent.constant.js";

const createParent = catchAsync(async (req, res) => {
  const result = await ParentService.createParent(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Parent created successfully!",
    data: result,
  });
});

const getAllParents = catchAsync(async (req, res) => {
  const filters = pick(req.query, parentFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await ParentService.getAllParents(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Parents fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getParentById = catchAsync(async (req, res) => {
  const result = await ParentService.getParentById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Parent fetched successfully!",
    data: result,
  });
});

const updateParent = catchAsync(async (req, res) => {
  const result = await ParentService.updateParent(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Parent updated successfully!",
    data: result,
  });
});

const deleteParent = catchAsync(async (req, res) => {
  const result = await ParentService.deleteParent(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Parent deleted successfully!",
    data: result,
  });
});

export const ParentController = {
  createParent,
  getAllParents,
  getParentById,
  updateParent,
  deleteParent,
};
