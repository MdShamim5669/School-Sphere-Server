import { Buffer } from "node:buffer";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import pick from "../../utils/pick.js";
import { TeacherService } from "./teacher.service.js";
import { teacherFilterableFields } from "./teacher.constant.js";
import { uploadToCloudinary, deleteImageFromCloudinary } from "../../lib/cloudinary.js";
import AppError from "../../errors/AppError.js";

const createTeacher = catchAsync(async (req, res) => {
  const result = await TeacherService.createTeacher(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Teacher created successfully!",
    data: result,
  });
});

const getAllTeachers = catchAsync(async (req, res) => {
  const filters = pick(req.query, teacherFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await TeacherService.getAllTeachers(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teachers fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getTeacherById = catchAsync(async (req, res) => {
  const result = await TeacherService.getTeacherById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher fetched successfully!",
    data: result,
  });
});

const updateTeacher = catchAsync(async (req, res) => {
  const result = await TeacherService.updateTeacher(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher updated successfully!",
    data: result,
  });
});

const deleteTeacher = catchAsync(async (req, res) => {
  const result = await TeacherService.deleteTeacher(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher deleted successfully!",
    data: result,
  });
});

const uploadTeacherImage = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, "Image file is required");
  }

  const uploadRes = await uploadToCloudinary(
    req.file.buffer,
    req.file.mimetype,
    "school-sphere/teachers"
  );

  try {
    const result = await TeacherService.updateTeacherImage(
      req.params.id,
      uploadRes.secure_url
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Teacher image uploaded successfully!",
      data: result,
    });
  } catch (error) {
    await deleteImageFromCloudinary(uploadRes.public_id);
    throw error;
  }
});

const removeTeacherImage = catchAsync(async (req, res) => {
  const result = await TeacherService.removeTeacherImage(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher image removed successfully!",
    data: result,
  });
});

export const TeacherController = {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  uploadTeacherImage,
  removeTeacherImage,
};
