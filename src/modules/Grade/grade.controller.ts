import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { GradeService } from "./grade.service.js";

const createGrade = catchAsync(async (req, res) => {
  const result = await GradeService.createGrade(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Grade created successfully!",
    data: result,
  });
});

const getAllGrades = catchAsync(async (_req, res) => {
  const result = await GradeService.getAllGrades();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Grades fetched successfully!",
    data: result,
  });
});

export const GradeController = {
  createGrade,
  getAllGrades,
};
