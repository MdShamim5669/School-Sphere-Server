import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import pick from "../../utils/pick.js";
import { AnnouncementService } from "./announcement.service.js";
import { announcementFilterableFields } from "./announcement.constant.js";

const createAnnouncement = catchAsync(async (req, res) => {
  const result = await AnnouncementService.createAnnouncement(req.body, req.user);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Announcement created successfully!",
    data: result,
  });
});

const getAllAnnouncements = catchAsync(async (req, res) => {
  const filters = pick(req.query, announcementFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await AnnouncementService.getAllAnnouncements(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Announcements fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const updateAnnouncement = catchAsync(async (req, res) => {
  const result = await AnnouncementService.updateAnnouncement(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Announcement updated successfully!",
    data: result,
  });
});

const deleteAnnouncement = catchAsync(async (req, res) => {
  const result = await AnnouncementService.deleteAnnouncement(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Announcement deleted successfully!",
    data: result,
  });
});

export const AnnouncementController = {
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};
