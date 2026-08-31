import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { IPaginationOptions } from "../../interface/error.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import { ICreateSubjectInput, ISubjectFilterRequest, IUpdateSubjectInput } from "./subject.interface.js";
import { subjectSearchableFields } from "./subject.constant.js";

const createSubject = async (payload: ICreateSubjectInput) => {
  return await prisma.$transaction(async (tx) => {
    const isSubjectExist = await tx.subject.findUnique({
      where: { name: payload.name },
    });

    if (isSubjectExist) {
      throw new AppError(httpStatus.CONFLICT, "Subject with this name already exists");
    }

    const { teacherIds, name } = payload;

    const result = await tx.subject.create({
      data: {
        name,
        ...(teacherIds && teacherIds.length > 0
          ? {
              teachers: {
                connect: teacherIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: {
        teachers: true,
      },
    });

    return result;
  });
};

const getAllSubjects = async (
  filters: ISubjectFilterRequest = {},
  options: IPaginationOptions = {}
) => {
  const subjectQuery = new QueryBuilder<Prisma.SubjectWhereInput>(
    filters,
    options
  )
    .search(subjectSearchableFields)
    .filter();

  const queryOptions = subjectQuery.build();

  const [result, total] = await Promise.all([
    prisma.subject.findMany({
      ...queryOptions,
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            teachers: true,
          },
        },
      },
    }),
    prisma.subject.count({ where: queryOptions.where }),
  ]);

  return {
    meta: subjectQuery.getMeta(total),
    data: result,
  };
};

const updateSubject = async (id: string, payload: IUpdateSubjectInput) => {
  return await prisma.$transaction(async (tx) => {
    const isSubjectExist = await tx.subject.findUnique({ where: { id } });
    if (!isSubjectExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Subject not found");
    }

    const { teacherIds, name } = payload;

    const result = await tx.subject.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(teacherIds
          ? {
              teachers: {
                set: teacherIds.map((tId) => ({ id: tId })),
              },
            }
          : {}),
      },
      include: {
        teachers: true,
      },
    });

    return result;
  });
};

const deleteSubject = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const isSubjectExist = await tx.subject.findUnique({
      where: { id },
      include: { lessons: true },
    });

    if (!isSubjectExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Subject not found");
    }

    if (isSubjectExist.lessons.length > 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot delete subject with scheduled lessons."
      );
    }

    const result = await tx.subject.delete({ where: { id } });
    return result;
  });
};

export const SubjectService = {
  createSubject,
  getAllSubjects,
  updateSubject,
  deleteSubject,
};
