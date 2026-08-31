import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { IPaginationOptions } from "../../interface/error.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import { IAnnouncementFilterRequest, ICreateAnnouncementInput, IUpdateAnnouncementInput } from "./announcement.interface.js";
import { announcementSearchableFields } from "./announcement.constant.js";

const createAnnouncement = async (
  payload: ICreateAnnouncementInput,
  user: any
) => {
  return await prisma.$transaction(async (tx) => {
    if (user.role === "TEACHER") {
      if (!payload.classId) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "Teachers can only create announcements for their supervised classes"
        );
      }

      const classData = await tx.class.findUnique({
        where: { id: payload.classId },
      });

      if (classData?.supervisorId !== user.id) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You can only create announcements for your supervised class"
        );
      }
    }

    const result = await tx.announcement.create({
      data: {
        ...payload,
        date: new Date(payload.date),
      },
      include: {
        class: true,
      },
    });

    return result;
  });
};

const getAllAnnouncements = async (
  filters: IAnnouncementFilterRequest = {},
  options: IPaginationOptions = {}
) => {
  const { classId } = filters;

  const announcementQuery = new QueryBuilder<Prisma.AnnouncementWhereInput>(
    filters,
    options
  )
    .search(announcementSearchableFields)
    .filter(["classId"]);

  if (classId) {
    announcementQuery.rawWhere({
      OR: [{ classId }, { classId: null }],
    });
  }

  const queryOptions = announcementQuery.build();

  const [result, total] = await Promise.all([
    prisma.announcement.findMany({
      ...queryOptions,
      include: {
        class: true,
      },
    }),
    prisma.announcement.count({ where: queryOptions.where }),
  ]);

  return {
    meta: announcementQuery.getMeta(total),
    data: result,
  };
};

const updateAnnouncement = async (
  id: string,
  payload: IUpdateAnnouncementInput
) => {
  return await prisma.$transaction(async (tx) => {
    const isExist = await tx.announcement.findUnique({ where: { id } });
    if (!isExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Announcement not found");
    }

    const result = await tx.announcement.update({
      where: { id },
      data: {
        ...payload,
        ...(payload.date && { date: new Date(payload.date) }),
      },
      include: {
        class: true,
      },
    });

    return result;
  });
};

const deleteAnnouncement = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const isExist = await tx.announcement.findUnique({ where: { id } });
    if (!isExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Announcement not found");
    }

    const result = await tx.announcement.delete({ where: { id } });
    return result;
  });
};

export const AnnouncementService = {
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};
