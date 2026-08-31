import { Buffer } from "node:buffer";
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import pick from "../../utils/pick.js";
import { StudentService } from "./student.service.js";
import { studentFilterableFields } from "./student.constant.js";
import { uploadToCloudinary, deleteImageFromCloudinary } from "../../lib/cloudinary.js";
import AppError from "../../errors/AppError.js";

const createStudent = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentService.createStudent(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Student created successfully!",
    data: result,
  });
});

const getAllStudents = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, studentFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await StudentService.getAllStudents(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Students fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getStudentById = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentService.getStudentById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student fetched successfully!",
    data: result,
  });
});

const updateStudent = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentService.updateStudent(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student updated successfully!",
    data: result,
  });
});

const deleteStudent = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentService.deleteStudent(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student deleted successfully!",
    data: result,
  });
});

const uploadStudentImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, "Image file is required");
  }

  const uploadRes = await uploadToCloudinary(
    req.file.buffer,
    req.file.mimetype,
    "school-sphere/students"
  );

  try {
    const result = await StudentService.updateStudentImage(
      req.params.id,
      uploadRes.secure_url
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Student image uploaded successfully!",
      data: result,
    });
  } catch (error) {
    await deleteImageFromCloudinary(uploadRes.public_id);
    throw error;
  }
});

const removeStudentImage = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentService.removeStudentImage(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student image removed successfully!",
    data: result,
  });
});

export const StudentController = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  uploadStudentImage,
  removeStudentImage,
};
