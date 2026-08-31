import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import config from "../../config/index.js";
import AppError from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { ILoginResponse, ILoginUser, IRefreshTokenResponse } from "./auth.interface.js";
import { createToken, verifyToken } from "./auth.utils.js";
import { JwtPayload } from "jsonwebtoken";

const loginUser = async (payload: ILoginUser): Promise<ILoginResponse> => {
  let user: any = null;
  let role: string = "";

  // Check Admin
  user = await prisma.admin.findUnique({ where: { username: payload.username } });
  if (user) role = "ADMIN";

  // Check Teacher
  if (!user) {
    user = await prisma.teacher.findUnique({ where: { username: payload.username } });
    if (user) role = "TEACHER";
  }

  // Check Parent
  if (!user) {
    user = await prisma.parent.findUnique({ where: { username: payload.username } });
    if (user) role = "PARENT";
  }

  // Check Student
  if (!user) {
    user = await prisma.student.findUnique({ where: { username: payload.username } });
    if (user) role = "STUDENT";
  }

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.FORBIDDEN, "Password does not match");
  }

  const jwtPayload = {
    id: user.id,
    role,
    username: user.username,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.access_secret,
    config.jwt.access_expires_in
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      role,
    },
  };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  let decoded: JwtPayload;
  try {
    decoded = verifyToken(token, config.jwt.refresh_secret) as JwtPayload;
  } catch (_err) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }

  const { id, role } = decoded;

  let user = null;
  if (role === "ADMIN") user = await prisma.admin.findUnique({ where: { id } });
  if (role === "TEACHER") user = await prisma.teacher.findUnique({ where: { id } });
  if (role === "PARENT") user = await prisma.parent.findUnique({ where: { id } });
  if (role === "STUDENT") user = await prisma.student.findUnique({ where: { id } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
  }

  const jwtPayload = {
    id: user.id,
    role,
    username: user.username,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.access_secret,
    config.jwt.access_expires_in
  );

  return {
    accessToken,
  };
};

export const AuthService = {
  loginUser,
  refreshToken,
};
