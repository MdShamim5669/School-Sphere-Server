import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import config from "../../config/index.js";
import AppError from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { deleteImageFromCloudinary } from "../../lib/cloudinary.js";
import { IPaginationOptions } from "../../interface/error.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import { ICreateTeacherInput, ITeacherFilterRequest, IUpdateTeacherInput } from "./teacher.interface.js";
import { teacherSearchableFields } from "./teacher.constant.js";

const createTeacher = async (payload: ICreateTeacherInput) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_round
  );

  const { subjectIds, ...teacherData } = payload;

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const result = await tx.teacher.create({
      data: {
        ...teacherData,
        birthday: new Date(payload.birthday),
        password: hashedPassword,
        ...(subjectIds && subjectIds.length > 0
          ? {
              subjects: {
                connect: subjectIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: {
        subjects: true,
      },
    });

    const { password, ...safeTeacher } = result;
    return safeTeacher;
  });
};

const getAllTeachers = async (
  filters: ITeacherFilterRequest,
  options: IPaginationOptions
) => {
  const { subjectId, classId } = filters;

  const teacherQuery = new QueryBuilder<Prisma.TeacherWhereInput>(
    filters,
    options
  )
    .search(teacherSearchableFields)
    .filter(["subjectId", "classId"]);

  if (subjectId) {
    teacherQuery.rawWhere({
      subjects: {
        some: { id: subjectId },
      },
    });
  }

  if (classId) {
    teacherQuery.rawWhere({
      lessons: {
        some: { classId },
      },
    });
  }

  const queryOptions = teacherQuery.build();

  const [result, total] = await Promise.all([
    prisma.teacher.findMany({
      ...queryOptions,
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
        email: true,
        phone: true,
        address: true,
        img: true,
        bloodType: true,
        sex: true,
        birthday: true,
        createdAt: true,
        updatedAt: true,
        subjects: true,
        supervisedClasses: true,
      },
    }),
    prisma.teacher.count({ where: queryOptions.where }),
  ]);

  return {
    meta: teacherQuery.getMeta(total),
    data: result,
  };
};

const getTeacherById = async (id: string) => {
  const result = await prisma.teacher.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      name: true,
      surname: true,
      email: true,
      phone: true,
      address: true,
      img: true,
      bloodType: true,
      sex: true,
      birthday: true,
      createdAt: true,
      updatedAt: true,
      subjects: true,
      lessons: true,
      supervisedClasses: true,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  return result;
};

const updateTeacher = async (id: string, payload: IUpdateTeacherInput) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const isTeacherExist = await tx.teacher.findUnique({ where: { id } });
    if (!isTeacherExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
    }

    const { subjectIds, ...teacherData } = payload;

    const result = await tx.teacher.update({
      where: { id },
      data: {
        ...teacherData,
        ...(payload.birthday && { birthday: new Date(payload.birthday) }),
        ...(subjectIds
          ? {
              subjects: {
                set: subjectIds.map((subId) => ({ id: subId })),
              },
            }
          : {}),
      },
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
        email: true,
        phone: true,
        address: true,
        img: true,
        bloodType: true,
        sex: true,
        birthday: true,
        createdAt: true,
        updatedAt: true,
        subjects: true,
      },
    });

    return result;
  });
};

const deleteTeacher = async (id: string) => {
  const deletedTeacher = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const isTeacherExist = await tx.teacher.findUnique({
      where: { id },
      include: { lessons: true, supervisedClasses: true },
    });

    if (!isTeacherExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
    }

    if (isTeacherExist.lessons.length > 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot delete teacher assigned to active lessons. Reassign lessons first."
      );
    }

    const result = await tx.teacher.delete({ where: { id } });
    return result;
  });

  if (deletedTeacher.img) {
    await deleteImageFromCloudinary(deletedTeacher.img);
  }

  return deletedTeacher;
};

const updateTeacherImage = async (id: string, imageUrl: string) => {
  let oldImageUrl: string | null = null;

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const isTeacherExist = await tx.teacher.findUnique({ where: { id } });
    if (!isTeacherExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
    }

    oldImageUrl = isTeacherExist.img;

    const updated = await tx.teacher.update({
      where: { id },
      data: { img: imageUrl },
      select: {
        id: true,
        username: true,
        name: true,
        img: true,
      },
    });

    return updated;
  });

  if (oldImageUrl) {
    await deleteImageFromCloudinary(oldImageUrl);
  }

  return result;
};

const removeTeacherImage = async (id: string) => {
  let oldImageUrl: string | null = null;

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const isTeacherExist = await tx.teacher.findUnique({ where: { id } });
    if (!isTeacherExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
    }

    oldImageUrl = isTeacherExist.img;

    const updated = await tx.teacher.update({
      where: { id },
      data: { img: null },
      select: {
        id: true,
        username: true,
        name: true,
        img: true,
      },
    });

    return updated;
  });

  if (oldImageUrl) {
    await deleteImageFromCloudinary(oldImageUrl);
  }

  return result;
};

export const TeacherService = {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  updateTeacherImage,
  removeTeacherImage,
};
