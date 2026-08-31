import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import config from "../../config/index.js";
import AppError from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { ICreateAdminInput } from "./admin.interface.js";

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

export const AdminService = {
  createAdmin,
};
