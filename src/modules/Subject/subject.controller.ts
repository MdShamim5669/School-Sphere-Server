import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import pick from "../../utils/pick.js";
import { SubjectService } from "./subject.service.js";
import { subjectFilterableFields } from "./subject.constant.js";

const createSubject = catchAsync(async (req, res) => {
  const result = await SubjectService.createSubject(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Subject created successfully!",
    data: result,
  });
});

const getAllSubjects = catchAsync(async (req, res) => {
  const filters = pick(req.query, subjectFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await SubjectService.getAllSubjects(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subjects fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const updateSubject = catchAsync(async (req, res) => {
  const result = await SubjectService.updateSubject(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subject updated successfully!",
    data: result,
  });
});

const deleteSubject = catchAsync(async (req, res) => {
  const result = await SubjectService.deleteSubject(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subject deleted successfully!",
    data: result,
  });
});

export const SubjectController = {
  createSubject,
  getAllSubjects,
  updateSubject,
  deleteSubject,
};
