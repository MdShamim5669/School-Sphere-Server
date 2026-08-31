import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { IPaginationOptions } from "../../interface/error.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import { ICreateAssignmentInput, IAssignmentFilterRequest, IUpdateAssignmentInput } from "./assignment.interface.js";
import { assignmentSearchableFields } from "./assignment.constant.js";

const createAssignment = async (payload: ICreateAssignmentInput, user: any) => {
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
        "You can only create assignments for your assigned lessons"
      );
    }

    const result = await tx.assignment.create({
      data: {
        ...payload,
        startDate: new Date(payload.startDate),
        dueDate: new Date(payload.dueDate),
      },
      include: {
        lesson: true,
      },
    });

    return result;
  });
};

const getAllAssignments = async (
  filters: IAssignmentFilterRequest = {},
  options: IPaginationOptions = {}
) => {
  const assignmentQuery = new QueryBuilder<Prisma.AssignmentWhereInput>(
    filters,
    options
  )
    .search(assignmentSearchableFields)
    .filter();

  const queryOptions = assignmentQuery.build();

  const [result, total] = await Promise.all([
    prisma.assignment.findMany({
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
    prisma.assignment.count({ where: queryOptions.where }),
  ]);

  return {
    meta: assignmentQuery.getMeta(total),
    data: result,
  };
};

const updateAssignment = async (
  id: string,
  payload: IUpdateAssignmentInput,
  user: any
) => {
  return await prisma.$transaction(async (tx) => {
    const assignment = await tx.assignment.findUnique({
      where: { id },
      include: { lesson: true },
    });

    if (!assignment) {
      throw new AppError(httpStatus.NOT_FOUND, "Assignment not found");
    }

    if (user.role === "TEACHER" && assignment.lesson.teacherId !== user.id) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You can only update assignments for your assigned lessons"
      );
    }

    const result = await tx.assignment.update({
      where: { id },
      data: {
        ...payload,
        ...(payload.startDate && { startDate: new Date(payload.startDate) }),
        ...(payload.dueDate && { dueDate: new Date(payload.dueDate) }),
      },
      include: {
        lesson: true,
      },
    });

    return result;
  });
};

const deleteAssignment = async (id: string, user: any) => {
  return await prisma.$transaction(async (tx) => {
    const assignment = await tx.assignment.findUnique({
      where: { id },
      include: { lesson: true },
    });

    if (!assignment) {
      throw new AppError(httpStatus.NOT_FOUND, "Assignment not found");
    }

    if (user.role === "TEACHER" && assignment.lesson.teacherId !== user.id) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You can only delete assignments for your assigned lessons"
      );
    }

    const result = await tx.assignment.delete({ where: { id } });
    return result;
  });
};

export const AssignmentService = {
  createAssignment,
  getAllAssignments,
  updateAssignment,
  deleteAssignment,
};
