import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import pick from "../../utils/pick.js";
import { ResultService } from "./result.service.js";
import { resultFilterableFields } from "./result.constant.js";

const createResult = catchAsync(async (req, res) => {
  const result = await ResultService.createResult(req.body, req.user);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Result recorded successfully!",
    data: result,
  });
});

const getResults = catchAsync(async (req, res) => {
  const filters = pick(req.query, resultFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await ResultService.getResults(filters, options, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Results retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const updateResult = catchAsync(async (req, res) => {
  const result = await ResultService.updateResult(
    req.params.id,
    req.body,
    req.user
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Result updated successfully!",
    data: result,
  });
});

const deleteResult = catchAsync(async (req, res) => {
  const result = await ResultService.deleteResult(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Result deleted successfully!",
    data: result,
  });
});

export const ResultController = {
  createResult,
  getResults,
  updateResult,
  deleteResult,
};
