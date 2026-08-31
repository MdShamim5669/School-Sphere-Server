import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { IPaginationOptions } from "../../interface/error.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import { ICreateClassInput, IClassFilterRequest, IUpdateClassInput } from "./class.interface.js";
import { classSearchableFields } from "./class.constant.js";

const createClass = async (payload: ICreateClassInput) => {
  return await prisma.$transaction(async (tx) => {
    const isGradeExist = await tx.grade.findUnique({
      where: { id: payload.gradeId },
    });

    if (!isGradeExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Grade does not exist");
    }

    if (payload.supervisorId) {
      const isSupervisorExist = await tx.teacher.findUnique({
        where: { id: payload.supervisorId },
      });
      if (!isSupervisorExist) {
        throw new AppError(httpStatus.NOT_FOUND, "Supervisor teacher does not exist");
      }
    }

    const result = await tx.class.create({
      data: payload,
      include: {
        grade: true,
        supervisor: true,
      },
    });

    return result;
  });
};

const getAllClasses = async (
  filters: IClassFilterRequest = {},
  options: IPaginationOptions = {}
) => {
  const classQuery = new QueryBuilder<Prisma.ClassWhereInput>(filters, options)
    .search(classSearchableFields)
    .filter();

  const queryOptions = classQuery.build();

  const [result, total] = await Promise.all([
    prisma.class.findMany({
      ...queryOptions,
      include: {
        grade: true,
        supervisor: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            students: true,
            lessons: true,
            events: true,
            announcements: true,
          },
        },
      },
    }),
    prisma.class.count({ where: queryOptions.where }),
  ]);

  return {
    meta: classQuery.getMeta(total),
    data: result,
  };
};

const getClassById = async (id: string) => {
  const result = await prisma.class.findUnique({
    where: { id },
    include: {
      grade: true,
      supervisor: true,
      students: true,
      lessons: {
        include: {
          subject: true,
          teacher: true,
        },
      },
      events: true,
      announcements: true,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Class not found");
  }

  return result;
};

const updateClass = async (id: string, payload: IUpdateClassInput) => {
  return await prisma.$transaction(async (tx) => {
    const isClassExist = await tx.class.findUnique({ where: { id } });
    if (!isClassExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Class not found");
    }

    if (payload.gradeId) {
      const isGradeExist = await tx.grade.findUnique({
        where: { id: payload.gradeId },
      });
      if (!isGradeExist) {
        throw new AppError(httpStatus.NOT_FOUND, "Grade does not exist");
      }
    }

    if (payload.supervisorId) {
      const isSupervisorExist = await tx.teacher.findUnique({
        where: { id: payload.supervisorId },
      });
      if (!isSupervisorExist) {
        throw new AppError(httpStatus.NOT_FOUND, "Supervisor teacher does not exist");
      }
    }

    const result = await tx.class.update({
      where: { id },
      data: payload,
      include: {
        grade: true,
        supervisor: true,
      },
    });

    return result;
  });
};

const deleteClass = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const isClassExist = await tx.class.findUnique({
      where: { id },
      include: { students: true, lessons: true },
    });

    if (!isClassExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Class not found");
    }

    if (isClassExist.students.length > 0 || isClassExist.lessons.length > 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot delete class with enrolled students or scheduled lessons."
      );
    }

    const result = await tx.class.delete({ where: { id } });
    return result;
  });
};

export const ClassService = {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
};
