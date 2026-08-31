import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import pick from "../../utils/pick.js";
import { ExamService } from "./exam.service.js";
import { examFilterableFields } from "./exam.constant.js";

const createExam = catchAsync(async (req, res) => {
  const result = await ExamService.createExam(req.body, req.user);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Exam created successfully!",
    data: result,
  });
});

const getAllExams = catchAsync(async (req, res) => {
  const filters = pick(req.query, examFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await ExamService.getAllExams(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Exams fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const updateExam = catchAsync(async (req, res) => {
  const result = await ExamService.updateExam(req.params.id, req.body, req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Exam updated successfully!",
    data: result,
  });
});

const deleteExam = catchAsync(async (req, res) => {
  const result = await ExamService.deleteExam(req.params.id, req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Exam deleted successfully!",
    data: result,
  });
});

export const ExamController = {
  createExam,
  getAllExams,
  updateExam,
  deleteExam,
};
