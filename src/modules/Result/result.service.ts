import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { IPaginationOptions } from "../../interface/error.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import { ICreateResultInput, IResultFilterRequest, IUpdateResultInput } from "./result.interface.js";

const createResult = async (payload: ICreateResultInput, user: any) => {
  // Enforce XOR constraint in service layer
  if (
    (payload.examId && payload.assignmentId) ||
    (!payload.examId && !payload.assignmentId)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A Result must reference either an exam or an assignment, never both and never neither"
    );
  }

  return await prisma.$transaction(async (tx) => {
    // Check student exists
    const student = await tx.student.findUnique({
      where: { id: payload.studentId },
    });

    if (!student) {
      throw new AppError(httpStatus.NOT_FOUND, "Student not found");
    }

    // Teacher ownership check
    if (user.role === "TEACHER") {
      let parentLessonTeacherId: string | undefined;

      if (payload.examId) {
        const exam = await tx.exam.findUnique({
          where: { id: payload.examId },
          include: { lesson: true },
        });
        parentLessonTeacherId = exam?.lesson?.teacherId;
      } else if (payload.assignmentId) {
        const assignment = await tx.assignment.findUnique({
          where: { id: payload.assignmentId },
          include: { lesson: true },
        });
        parentLessonTeacherId = assignment?.lesson?.teacherId;
      }

      if (parentLessonTeacherId !== user.id) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You can only record results for assessments under your assigned lessons"
        );
      }
    }

    const result = await tx.result.create({
      data: payload,
      include: {
        student: true,
        exam: true,
        assignment: true,
      },
    });

    return result;
  });
};

const getResults = async (
  filters: IResultFilterRequest = {},
  options: IPaginationOptions = {},
  user: any
) => {
  const { studentId, examId, assignmentId } = filters;

  const resultQuery = new QueryBuilder<Prisma.ResultWhereInput>(filters, options)
    .filter(["studentId", "examId", "assignmentId"]);

  // Scoped Visibility Constraints
  if (user.role === "STUDENT") {
    resultQuery.rawWhere({ studentId: user.id });
  } else if (user.role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { id: user.id },
      include: { students: true },
    });
    const childIds = parent?.students.map((s) => s.id) || [];
    resultQuery.rawWhere({ studentId: { in: childIds } });
  } else if (studentId) {
    resultQuery.rawWhere({ studentId });
  }

  if (examId) resultQuery.rawWhere({ examId });
  if (assignmentId) resultQuery.rawWhere({ assignmentId });

  const queryOptions = resultQuery.build();

  const [result, total] = await Promise.all([
    prisma.result.findMany({
      ...queryOptions,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            surname: true,
            class: true,
          },
        },
        exam: true,
        assignment: true,
      },
    }),
    prisma.result.count({ where: queryOptions.where }),
  ]);

  return {
    meta: resultQuery.getMeta(total),
    data: result,
  };
};

const updateResult = async (
  id: string,
  payload: IUpdateResultInput,
  user: any
) => {
  return await prisma.$transaction(async (tx) => {
    const existingResult = await tx.result.findUnique({
      where: { id },
      include: {
        exam: { include: { lesson: true } },
        assignment: { include: { lesson: true } },
      },
    });

    if (!existingResult) {
      throw new AppError(httpStatus.NOT_FOUND, "Result not found");
    }

    if (user.role === "TEACHER") {
      const teacherId =
        existingResult.exam?.lesson?.teacherId ||
        existingResult.assignment?.lesson?.teacherId;
      if (teacherId !== user.id) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You can only update results for your own lessons"
        );
      }
    }

    const result = await tx.result.update({
      where: { id },
      data: payload,
    });

    return result;
  });
};

const deleteResult = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const existingResult = await tx.result.findUnique({ where: { id } });
    if (!existingResult) {
      throw new AppError(httpStatus.NOT_FOUND, "Result not found");
    }

    const result = await tx.result.delete({ where: { id } });
    return result;
  });
};

export const ResultService = {
  createResult,
  getResults,
  updateResult,
  deleteResult,
};
