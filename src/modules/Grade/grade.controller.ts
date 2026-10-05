import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import pick from "../../utils/pick.js";
import { GradeService } from "./grade.service.js";
import { gradeFilterableFields } from "./grade.constant.js";

const createGrade = catchAsync(async (req, res) => {
  const result = await GradeService.createGrade(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Grade created successfully!",
    data: result,
  });
});

const getAllGrades = catchAsync(async (req, res) => {
  const filters = pick(req.query, gradeFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await GradeService.getAllGrades(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Grades fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getGradeById = catchAsync(async (req, res) => {
  const result = await GradeService.getGradeById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Grade fetched successfully!",
    data: result,
  });
});

const updateGrade = catchAsync(async (req, res) => {
  const result = await GradeService.updateGrade(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Grade updated successfully!",
    data: result,
  });
});

const deleteGrade = catchAsync(async (req, res) => {
  const result = await GradeService.deleteGrade(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Grade deleted successfully!",
    data: result,
  });
});

export const GradeController = {
  createGrade,
  getAllGrades,
  getGradeById,
  updateGrade,
  deleteGrade,
};
