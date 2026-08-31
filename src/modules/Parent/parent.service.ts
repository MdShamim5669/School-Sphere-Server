import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import config from "../../config/index.js";
import AppError from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { IPaginationOptions } from "../../interface/error.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import { ICreateParentInput, IParentFilterRequest, IUpdateParentInput } from "./parent.interface.js";
import { parentSearchableFields } from "./parent.constant.js";

const createParent = async (payload: ICreateParentInput) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_round
  );

  return await prisma.$transaction(async (tx) => {
    const result = await tx.parent.create({
      data: {
        ...payload,
        password: hashedPassword,
      },
    });

    const { password, ...safeParent } = result;
    return safeParent;
  });
};

const getAllParents = async (
  filters: IParentFilterRequest,
  options: IPaginationOptions
) => {
  const parentQuery = new QueryBuilder<Prisma.ParentWhereInput>(
    filters,
    options
  )
    .search(parentSearchableFields)
    .filter();

  const queryOptions = parentQuery.build();

  const [result, total] = await Promise.all([
    prisma.parent.findMany({
      ...queryOptions,
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        students: true,
      },
    }),
    prisma.parent.count({ where: queryOptions.where }),
  ]);

  return {
    meta: parentQuery.getMeta(total),
    data: result,
  };
};

const getParentById = async (id: string) => {
  const result = await prisma.parent.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      name: true,
      surname: true,
      email: true,
      phone: true,
      address: true,
      createdAt: true,
      updatedAt: true,
      students: {
        include: {
          class: true,
          grade: true,
        },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Parent not found");
  }

  return result;
};

const updateParent = async (id: string, payload: IUpdateParentInput) => {
  return await prisma.$transaction(async (tx) => {
    const isParentExist = await tx.parent.findUnique({ where: { id } });
    if (!isParentExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Parent not found");
    }

    const result = await tx.parent.update({
      where: { id },
      data: payload,
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return result;
  });
};

const deleteParent = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const isParentExist = await tx.parent.findUnique({
      where: { id },
      include: { students: true },
    });

    if (!isParentExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Parent not found");
    }

    if (isParentExist.students.length > 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot delete parent with linked students."
      );
    }

    const result = await tx.parent.delete({ where: { id } });
    return result;
  });
};

export const ParentService = {
  createParent,
  getAllParents,
  getParentById,
  updateParent,
  deleteParent,
};
