import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import pick from "../../utils/pick.js";
import { LessonService } from "./lesson.service.js";
import { lessonFilterableFields } from "./lesson.constant.js";

const createLesson = catchAsync(async (req, res) => {
  const result = await LessonService.createLesson(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Lesson scheduled successfully!",
    data: result,
  });
});

const getAllLessons = catchAsync(async (req, res) => {
  const filters = pick(req.query, lessonFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await LessonService.getAllLessons(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Lessons fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getLessonById = catchAsync(async (req, res) => {
  const result = await LessonService.getLessonById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Lesson fetched successfully!",
    data: result,
  });
});

const updateLesson = catchAsync(async (req, res) => {
  const result = await LessonService.updateLesson(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Lesson updated successfully!",
    data: result,
  });
});

const deleteLesson = catchAsync(async (req, res) => {
  const result = await LessonService.deleteLesson(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Lesson deleted successfully!",
    data: result,
  });
});

export const LessonController = {
  createLesson,
  getAllLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
};
