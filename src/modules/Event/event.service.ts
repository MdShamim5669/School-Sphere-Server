import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { IPaginationOptions } from "../../interface/error.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import { ICreateEventInput, IEventFilterRequest, IUpdateEventInput } from "./event.interface.js";
import { eventSearchableFields } from "./event.constant.js";

const createEvent = async (payload: ICreateEventInput, user: any) => {
  return await prisma.$transaction(async (tx) => {
    if (user.role === "TEACHER") {
      if (!payload.classId) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "Teachers can only create events for their supervised classes"
        );
      }

      const classData = await tx.class.findUnique({
        where: { id: payload.classId },
      });

      if (classData?.supervisorId !== user.id) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You can only create events for your supervised class"
        );
      }
    }

    const result = await tx.event.create({
      data: {
        ...payload,
        startTime: new Date(payload.startTime),
        endTime: new Date(payload.endTime),
      },
      include: {
        class: true,
      },
    });

    return result;
  });
};

const getAllEvents = async (
  filters: IEventFilterRequest = {},
  options: IPaginationOptions = {}
) => {
  const { classId } = filters;

  const eventQuery = new QueryBuilder<Prisma.EventWhereInput>(filters, options)
    .search(eventSearchableFields)
    .filter(["classId"]);

  if (classId) {
    eventQuery.rawWhere({
      OR: [{ classId }, { classId: null }],
    });
  }

  const queryOptions = eventQuery.build();

  const [result, total] = await Promise.all([
    prisma.event.findMany({
      ...queryOptions,
      include: {
        class: true,
      },
    }),
    prisma.event.count({ where: queryOptions.where }),
  ]);

  return {
    meta: eventQuery.getMeta(total),
    data: result,
  };
};

const updateEvent = async (id: string, payload: IUpdateEventInput) => {
  return await prisma.$transaction(async (tx) => {
    const isExist = await tx.event.findUnique({ where: { id } });
    if (!isExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Event not found");
    }

    const result = await tx.event.update({
      where: { id },
      data: {
        ...payload,
        ...(payload.startTime && { startTime: new Date(payload.startTime) }),
        ...(payload.endTime && { endTime: new Date(payload.endTime) }),
      },
      include: {
        class: true,
      },
    });

    return result;
  });
};

const deleteEvent = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const isExist = await tx.event.findUnique({ where: { id } });
    if (!isExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Event not found");
    }

    const result = await tx.event.delete({ where: { id } });
    return result;
  });
};

export const EventService = {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
};
