import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { IPaginationOptions } from "../../interface/error.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import { ICreateLessonInput, ILessonFilterRequest, IUpdateLessonInput } from "./lesson.interface.js";
import { lessonSearchableFields } from "./lesson.constant.js";

const checkTimeConflictWithTx = async (
  tx: any,
  day: any,
  startTime: Date,
  endTime: Date,
  teacherId: string,
  classId: string,
  excludeLessonId?: string
) => {
  const conflictingLesson = await tx.lesson.findFirst({
    where: {
      day,
      OR: [{ teacherId }, { classId }],
      ...(excludeLessonId && { NOT: { id: excludeLessonId } }),
      AND: [
        {
          startTime: {
            lt: endTime,
          },
        },
        {
          endTime: {
            gt: startTime,
          },
        },
      ],
    },
  });

  return !!conflictingLesson;
};

const createLesson = async (payload: ICreateLessonInput) => {
  const start = new Date(payload.startTime);
  const end = new Date(payload.endTime);

  if (start >= end) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "End time must be greater than start time"
    );
  }

  return await prisma.$transaction(async (tx) => {
    // Conflict Check within transaction
    const hasConflict = await checkTimeConflictWithTx(
      tx,
      payload.day,
      start,
      end,
      payload.teacherId,
      payload.classId
    );

    if (hasConflict) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Lesson time slot conflicts with an existing lesson for this teacher or class"
      );
    }

    const result = await tx.lesson.create({
      data: {
        ...payload,
        startTime: start,
        endTime: end,
      },
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
    });

    return result;
  });
};

const getAllLessons = async (
  filters: ILessonFilterRequest = {},
  options: IPaginationOptions = {}
) => {
  const { classId, teacherId, subjectId, day } = filters;

  const lessonQuery = new QueryBuilder<Prisma.LessonWhereInput>(
    filters,
    options
  )
    .search(lessonSearchableFields)
    .filter(["classId", "teacherId", "subjectId", "day"]);

  if (classId) lessonQuery.rawWhere({ classId });
  if (teacherId) lessonQuery.rawWhere({ teacherId });
  if (subjectId) lessonQuery.rawWhere({ subjectId });
  if (day) lessonQuery.rawWhere({ day });

  const queryOptions = lessonQuery.build();

  const [result, total] = await Promise.all([
    prisma.lesson.findMany({
      ...queryOptions,
      include: {
        subject: true,
        class: true,
        teacher: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
          },
        },
        _count: {
          select: {
            exams: true,
            assignments: true,
            attendances: true,
          },
        },
      },
    }),
    prisma.lesson.count({ where: queryOptions.where }),
  ]);

  return {
    meta: lessonQuery.getMeta(total),
    data: result,
  };
};

const getLessonById = async (id: string) => {
  const result = await prisma.lesson.findUnique({
    where: { id },
    include: {
      subject: true,
      class: true,
      teacher: true,
      exams: true,
      assignments: true,
      attendances: true,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Lesson not found");
  }

  return result;
};

const updateLesson = async (id: string, payload: IUpdateLessonInput) => {
  return await prisma.$transaction(async (tx) => {
    const isLessonExist = await tx.lesson.findUnique({ where: { id } });
    if (!isLessonExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Lesson not found");
    }

    const day = payload.day || isLessonExist.day;
    const start = payload.startTime
      ? new Date(payload.startTime)
      : isLessonExist.startTime;
    const end = payload.endTime
      ? new Date(payload.endTime)
      : isLessonExist.endTime;
    const teacherId = payload.teacherId || isLessonExist.teacherId;
    const classId = payload.classId || isLessonExist.classId;

    if (start >= end) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "End time must be greater than start time"
      );
    }

    // Conflict Check within transaction
    const hasConflict = await checkTimeConflictWithTx(
      tx,
      day,
      start,
      end,
      teacherId,
      classId,
      id
    );

    if (hasConflict) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Lesson time slot conflicts with an existing lesson for this teacher or class"
      );
    }

    const result = await tx.lesson.update({
      where: { id },
      data: {
        ...payload,
        ...(payload.startTime && { startTime: start }),
        ...(payload.endTime && { endTime: end }),
      },
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
    });

    return result;
  });
};

const deleteLesson = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const isLessonExist = await tx.lesson.findUnique({ where: { id } });
    if (!isLessonExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Lesson not found");
    }

    const result = await tx.lesson.delete({ where: { id } });
    return result;
  });
};

export const LessonService = {
  createLesson,
  getAllLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
};
