import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import config from "../../config/index.js";
import AppError from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { IPaginationOptions } from "../../interface/error.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import { ICreateAdminInput } from "./admin.interface.js";
import { adminSearchableFields } from "./admin.constant.js";

const createAdmin = async (payload: ICreateAdminInput) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_round
  );

  return await prisma.$transaction(async (tx) => {
    const isExist = await tx.admin.findUnique({
      where: { username: payload.username },
    });

    if (isExist) {
      throw new AppError(httpStatus.CONFLICT, "Admin with this username already exists");
    }

    const result = await tx.admin.create({
      data: {
        username: payload.username,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return result;
  });
};

const getAllAdmins = async (
  filters: Record<string, any> = {},
  options: IPaginationOptions = {}
) => {
  const adminQuery = new QueryBuilder<Prisma.AdminWhereInput>(filters, options)
    .search(adminSearchableFields)
    .filter();

  const queryOptions = adminQuery.build();

  const [result, total] = await Promise.all([
    prisma.admin.findMany({
      ...queryOptions,
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.admin.count({ where: queryOptions.where }),
  ]);

  return {
    meta: adminQuery.getMeta(total),
    data: result,
  };
};

const getAdminById = async (id: string) => {
  const result = await prisma.admin.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
  }

  return result;
};

const deleteAdmin = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const totalAdmins = await tx.admin.count();
    if (totalAdmins <= 1) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot delete the last remaining platform administrator"
      );
    }

    const isExist = await tx.admin.findUnique({ where: { id } });
    if (!isExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
    }

    const result = await tx.admin.delete({
      where: { id },
      select: {
        id: true,
        username: true,
      },
    });

    return result;
  });
};

export const AdminService = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  deleteAdmin,
};
