import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import config from "../../config/index.js";
import AppError from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { deleteImageFromCloudinary } from "../../lib/cloudinary.js";
import { IPaginationOptions } from "../../interface/error.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import { ICreateStudentInput, IStudentFilterRequest, IUpdateStudentInput } from "./student.interface.js";
import { studentSearchableFields } from "./student.constant.js";

const createStudent = async (payload: ICreateStudentInput) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_round
  );

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Check Parent exists
    const parent = await tx.parent.findUnique({ where: { id: payload.parentId } });
    if (!parent) {
      throw new AppError(httpStatus.NOT_FOUND, "Parent does not exist");
    }

    // Check Class and Grade
    const classData = await tx.class.findUnique({
      where: { id: payload.classId },
      include: { _count: { select: { students: true } } },
    });

    if (!classData) {
      throw new AppError(httpStatus.NOT_FOUND, "Class does not exist");
    }

    // PRD Constraint: Student grade must match Class grade
    if (classData.gradeId !== payload.gradeId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Student grade must match the grade of the assigned class"
      );
    }

    // PRD Constraint: Class capacity limit
    if (classData._count.students >= classData.capacity) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Class has reached its maximum student capacity"
      );
    }

    const result = await tx.student.create({
      data: {
        ...payload,
        birthday: new Date(payload.birthday),
        password: hashedPassword,
      },
      include: {
        class: true,
        grade: true,
        parent: true,
      },
    });

    const { password, ...safeStudent } = result;
    return safeStudent;
  });
};

const getAllStudents = async (
  filters: IStudentFilterRequest,
  options: IPaginationOptions
) => {
  const { classId, gradeId, parentId } = filters;

  const studentQuery = new QueryBuilder<Prisma.StudentWhereInput>(
    filters,
    options
  )
    .search(studentSearchableFields)
    .filter(["classId", "gradeId", "parentId"]);

  if (classId) studentQuery.rawWhere({ classId });
  if (gradeId) studentQuery.rawWhere({ gradeId });
  if (parentId) studentQuery.rawWhere({ parentId });

  const queryOptions = studentQuery.build();

  const [result, total] = await Promise.all([
    prisma.student.findMany({
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
        parentId: true,
        classId: true,
        gradeId: true,
        createdAt: true,
        updatedAt: true,
        class: true,
        grade: true,
        parent: {
          select: {
            id: true,
            name: true,
            surname: true,
            phone: true,
            email: true,
          },
        },
      },
    }),
    prisma.student.count({ where: queryOptions.where }),
  ]);

  return {
    meta: studentQuery.getMeta(total),
    data: result,
  };
};

const getStudentById = async (id: string) => {
  const result = await prisma.student.findUnique({
    where: { id },
    include: {
      class: true,
      grade: true,
      parent: {
        select: {
          id: true,
          name: true,
          surname: true,
          phone: true,
          email: true,
        },
      },
      attendances: true,
      results: true,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  const { password, ...safeStudent } = result;
  return safeStudent;
};

const updateStudent = async (id: string, payload: IUpdateStudentInput) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const isStudentExist = await tx.student.findUnique({ where: { id } });
    if (!isStudentExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Student not found");
    }

    if (payload.classId || payload.gradeId) {
      const targetClassId = payload.classId || isStudentExist.classId;
      const targetGradeId = payload.gradeId || isStudentExist.gradeId;

      const classData = await tx.class.findUnique({
        where: { id: targetClassId },
        include: { _count: { select: { students: true } } },
      });

      if (!classData) {
        throw new AppError(httpStatus.NOT_FOUND, "Class does not exist");
      }

      if (classData.gradeId !== targetGradeId) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Student grade must match the grade of the assigned class"
        );
      }

      if (payload.classId && payload.classId !== isStudentExist.classId) {
        if (classData._count.students >= classData.capacity) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            "Class has reached its maximum student capacity"
          );
        }
      }
    }

    const result = await tx.student.update({
      where: { id },
      data: {
        ...payload,
        ...(payload.birthday && { birthday: new Date(payload.birthday) }),
      },
      include: {
        class: true,
        grade: true,
      },
    });

    const { password, ...safeStudent } = result;
    return safeStudent;
  });
};

const deleteStudent = async (id: string) => {
  const deletedStudent = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const isStudentExist = await tx.student.findUnique({ where: { id } });
    if (!isStudentExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Student not found");
    }

    const result = await tx.student.delete({ where: { id } });
    return result;
  });

  if (deletedStudent.img) {
    await deleteImageFromCloudinary(deletedStudent.img);
  }

  return deletedStudent;
};

const updateStudentImage = async (id: string, imageUrl: string) => {
  let oldImageUrl: string | null = null;

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const isStudentExist = await tx.student.findUnique({ where: { id } });
    if (!isStudentExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Student not found");
    }

    oldImageUrl = isStudentExist.img;

    const updated = await tx.student.update({
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

const removeStudentImage = async (id: string) => {
  let oldImageUrl: string | null = null;

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const isStudentExist = await tx.student.findUnique({ where: { id } });
    if (!isStudentExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Student not found");
    }

    oldImageUrl = isStudentExist.img;

    const updated = await tx.student.update({
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

export const StudentService = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  updateStudentImage,
  removeStudentImage,
};
