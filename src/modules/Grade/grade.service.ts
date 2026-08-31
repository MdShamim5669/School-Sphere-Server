import httpStatus from "http-status";
import AppError from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { ICreateGradeInput } from "./grade.interface.js";

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

const getAllGrades = async () => {
  const result = await prisma.grade.findMany({
    orderBy: { level: "asc" },
    include: {
      classes: true,
      _count: {
        select: { students: true, classes: true },
      },
    },
  });

  return result;
};

export const GradeService = {
  createGrade,
  getAllGrades,
};
