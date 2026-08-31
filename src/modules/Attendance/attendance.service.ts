import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { IPaginationOptions } from "../../interface/error.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import { IAttendanceFilterRequest, ICreateAttendanceInput, IUpdateAttendanceInput } from "./attendance.interface.js";

const markAttendance = async (payload: ICreateAttendanceInput, user: any) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const lesson = await tx.lesson.findUnique({
      where: { id: payload.lessonId },
      include: { class: { include: { students: true } } },
    });

    if (!lesson) {
      throw new AppError(httpStatus.NOT_FOUND, "Lesson not found");
    }

    // Teacher authorization check
    if (user.role === "TEACHER" && lesson.teacherId !== user.id) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You can only mark attendance for your assigned lessons"
      );
    }

    // Verify student is enrolled in the lesson's class
    const isEnrolled = lesson.class.students.some((s) => s.id === payload.studentId);
    if (!isEnrolled) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Student is not enrolled in the class for this lesson"
      );
    }

    const attendanceDate = new Date(payload.date);

    // Check if attendance already marked for this date
    const isAlreadyMarked = await tx.attendance.findUnique({
      where: {
        studentId_lessonId_date: {
          studentId: payload.studentId,
          lessonId: payload.lessonId,
          date: attendanceDate,
        },
      },
    });

    if (isAlreadyMarked) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Attendance has already been marked for this student and lesson on this date"
      );
    }

    const result = await tx.attendance.create({
      data: {
        date: attendanceDate,
        present: payload.present,
        studentId: payload.studentId,
        lessonId: payload.lessonId,
      },
      include: {
        student: true,
        lesson: true,
      },
    });

    return result;
  });
};

const getAttendanceRecords = async (
  filters: IAttendanceFilterRequest = {},
  options: IPaginationOptions = {},
  user: any
) => {
  const { studentId, lessonId, date } = filters;

  const attendanceQuery = new QueryBuilder<Prisma.AttendanceWhereInput>(
    filters,
    options
  ).filter(["studentId", "lessonId", "date"]);

  // Scoped Visibility Constraints
  if (user.role === "STUDENT") {
    attendanceQuery.rawWhere({ studentId: user.id });
  } else if (user.role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { id: user.id },
      include: { students: true },
    });
    const childIds = parent?.students.map((s) => s.id) || [];
    attendanceQuery.rawWhere({ studentId: { in: childIds } });
  } else if (studentId) {
    attendanceQuery.rawWhere({ studentId });
  }

  if (lessonId) attendanceQuery.rawWhere({ lessonId });
  if (date) attendanceQuery.rawWhere({ date: new Date(date) });

  const queryOptions = attendanceQuery.build();

  const [result, total] = await Promise.all([
    prisma.attendance.findMany({
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
        lesson: {
          include: {
            subject: true,
            teacher: {
              select: {
                id: true,
                name: true,
                surname: true,
              },
            },
          },
        },
      },
    }),
    prisma.attendance.count({ where: queryOptions.where }),
  ]);

  return {
    meta: attendanceQuery.getMeta(total),
    data: result,
  };
};

const updateAttendance = async (
  id: string,
  payload: IUpdateAttendanceInput,
  user: any
) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const attendance = await tx.attendance.findUnique({
      where: { id },
      include: { lesson: true },
    });

    if (!attendance) {
      throw new AppError(httpStatus.NOT_FOUND, "Attendance record not found");
    }

    if (user.role === "TEACHER" && attendance.lesson.teacherId !== user.id) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You can only update attendance for your assigned lessons"
      );
    }

    const result = await tx.attendance.update({
      where: { id },
      data: { present: payload.present },
    });

    return result;
  });
};

export const AttendanceService = {
  markAttendance,
  getAttendanceRecords,
  updateAttendance,
};
