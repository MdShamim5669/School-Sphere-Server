import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { IPaginationOptions } from "../../interface/error.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import { ICreateGradeInput } from "./grade.interface.js";
import { gradeSearchableFields } from "./grade.constant.js";

const createGrade = async (payload: ICreateGradeInput) => {
  return await prisma.$transaction(async (tx) => {
    const isExist = await tx.grade.findUnique({
      where: { level: payload.level },
    });

    if (isExist) {
      throw new AppError(httpStatus.CONFLICT, "Grade level already exists");
    }

    const result = await tx.grade.create({
      data: payload,
    });

    return result;
  });
};

const getAllGrades = async (
  filters: Record<string, any> = {},
  options: IPaginationOptions = {}
) => {
  const { level } = filters;

  const gradeQuery = new QueryBuilder<Prisma.GradeWhereInput>(filters, options)
    .search(gradeSearchableFields)
    .filter(["level"]);

  if (level !== undefined && level !== null && level !== "") {
    gradeQuery.rawWhere({ level: Number(level) });
  }

  // Default sorting by level asc if not specified
  if (!options.sortBy && !filters.sortBy) {
    gradeQuery.sort("level", "asc");
  }

  const queryOptions = gradeQuery.build();

  const [result, total] = await Promise.all([
    prisma.grade.findMany({
      ...queryOptions,
      include: {
        classes: true,
        _count: {
          select: { students: true, classes: true },
        },
      },
    }),
    prisma.grade.count({ where: queryOptions.where }),
  ]);

  return {
    meta: gradeQuery.getMeta(total),
    data: result,
  };
};

const getGradeById = async (id: string) => {
  const result = await prisma.grade.findUnique({
    where: { id },
    include: {
      classes: {
        include: {
          supervisor: true,
          _count: { select: { students: true } },
        },
      },
      students: true,
      _count: {
        select: { students: true, classes: true },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Grade not found");
  }

  return result;
};

const updateGrade = async (id: string, payload: Partial<ICreateGradeInput>) => {
  return await prisma.$transaction(async (tx) => {
    const isExist = await tx.grade.findUnique({ where: { id } });
    if (!isExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Grade not found");
    }

    if (payload.level && payload.level !== isExist.level) {
      const isLevelTaken = await tx.grade.findUnique({
        where: { level: payload.level },
      });
      if (isLevelTaken) {
        throw new AppError(httpStatus.CONFLICT, "Grade level already exists");
      }
    }

    const result = await tx.grade.update({
      where: { id },
      data: payload,
    });

    return result;
  });
};

const deleteGrade = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const isExist = await tx.grade.findUnique({
      where: { id },
      include: {
        classes: true,
        students: true,
      },
    });

    if (!isExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Grade not found");
    }

    if (isExist.classes.length > 0 || isExist.students.length > 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot delete grade with assigned classes or enrolled students"
      );
    }

    const result = await tx.grade.delete({ where: { id } });
    return result;
  });
};

export const GradeService = {
  createGrade,
  getAllGrades,
  getGradeById,
  updateGrade,
  deleteGrade,
};
