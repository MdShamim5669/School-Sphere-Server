import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import pick from "../../utils/pick.js";
import AppError from "../../errors/AppError.js";
import { uploadToCloudinary, deleteImageFromCloudinary } from "../../lib/cloudinary.js";
import { EventService } from "./event.service.js";
import { eventFilterableFields } from "./event.constant.js";

const createEvent = catchAsync(async (req, res) => {
  const result = await EventService.createEvent(req.body, req.user);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Event created successfully!",
    data: result,
  });
});

const getAllEvents = catchAsync(async (req, res) => {
  const filters = pick(req.query, eventFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await EventService.getAllEvents(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Events fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const updateEvent = catchAsync(async (req, res) => {
  const result = await EventService.updateEvent(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event updated successfully!",
    data: result,
  });
});

const uploadEventImage = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, "Image file is required");
  }

  // Upload to Cloudinary dedicated events folder
  const uploadRes = await uploadToCloudinary(
    req.file.buffer,
    req.file.mimetype,
    "school-sphere/events"
  );

  try {
    const result = await EventService.updateEventImage(
      req.params.id,
      uploadRes.secure_url
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Event image uploaded successfully!",
      data: result,
    });
  } catch (error) {
    await deleteImageFromCloudinary(uploadRes.public_id);
    throw error;
  }
});

const removeEventImage = catchAsync(async (req, res) => {
  const result = await EventService.removeEventImage(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event image removed successfully!",
    data: result,
  });
});

const deleteEvent = catchAsync(async (req, res) => {
  const result = await EventService.deleteEvent(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event deleted successfully!",
    data: result,
  });
});

export const EventController = {
  createEvent,
  getAllEvents,
  updateEvent,
  uploadEventImage,
  removeEventImage,
  deleteEvent,
};
