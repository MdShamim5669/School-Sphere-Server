import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { IPaginationOptions } from "../../interface/error.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import { ICreateExamInput, IExamFilterRequest, IUpdateExamInput } from "./exam.interface.js";
import { examSearchableFields } from "./exam.constant.js";

const createExam = async (payload: ICreateExamInput, user: any) => {
  return await prisma.$transaction(async (tx) => {
    const lesson = await tx.lesson.findUnique({
      where: { id: payload.lessonId },
    });

    if (!lesson) {
      throw new AppError(httpStatus.NOT_FOUND, "Lesson not found");
    }

    // Teacher ownership check
    if (user.role === "TEACHER" && lesson.teacherId !== user.id) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You can only create exams for your assigned lessons"
      );
    }

    const result = await tx.exam.create({
      data: {
        ...payload,
        startTime: new Date(payload.startTime),
        endTime: new Date(payload.endTime),
      },
      include: {
        lesson: true,
      },
    });

    return result;
  });
};

const getAllExams = async (
  filters: IExamFilterRequest = {},
  options: IPaginationOptions = {}
) => {
  const examQuery = new QueryBuilder<Prisma.ExamWhereInput>(filters, options)
    .search(examSearchableFields)
    .filter();

  const queryOptions = examQuery.build();

  const [result, total] = await Promise.all([
    prisma.exam.findMany({
      ...queryOptions,
      include: {
        lesson: {
          include: {
            subject: true,
            class: true,
            teacher: {
              select: {
                id: true,
                name: true,
                surname: true,
              },
            },
          },
        },
        _count: {
          select: { results: true },
        },
      },
    }),
    prisma.exam.count({ where: queryOptions.where }),
  ]);

  return {
    meta: examQuery.getMeta(total),
    data: result,
  };
};

const updateExam = async (id: string, payload: IUpdateExamInput, user: any) => {
  return await prisma.$transaction(async (tx) => {
    const exam = await tx.exam.findUnique({
      where: { id },
      include: { lesson: true },
    });

    if (!exam) {
      throw new AppError(httpStatus.NOT_FOUND, "Exam not found");
    }

    if (user.role === "TEACHER" && exam.lesson.teacherId !== user.id) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You can only update exams for your assigned lessons"
      );
    }

    const result = await tx.exam.update({
      where: { id },
      data: {
        ...payload,
        ...(payload.startTime && { startTime: new Date(payload.startTime) }),
        ...(payload.endTime && { endTime: new Date(payload.endTime) }),
      },
      include: {
        lesson: true,
      },
    });

    return result;
  });
};

const deleteExam = async (id: string, user: any) => {
  return await prisma.$transaction(async (tx) => {
    const exam = await tx.exam.findUnique({
      where: { id },
      include: { lesson: true },
    });

    if (!exam) {
      throw new AppError(httpStatus.NOT_FOUND, "Exam not found");
    }

    if (user.role === "TEACHER" && exam.lesson.teacherId !== user.id) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You can only delete exams for your assigned lessons"
      );
    }

    const result = await tx.exam.delete({ where: { id } });
    return result;
  });
};

export const ExamService = {
  createExam,
  getAllExams,
  updateExam,
  deleteExam,
};
