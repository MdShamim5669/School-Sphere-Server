import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/index.js";
import AppError from "../errors/AppError.js";
import prisma from "../lib/prisma.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: string; role: string; username: string };
    }
  }
}

const auth = (...requiredRoles: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token =
        req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken;

      if (!token) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "You are not authorized to access this resource"
        );
      }

      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(
          token,
          config.jwt.access_secret
        ) as JwtPayload;
      } catch (_err) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
      }

      const { role, id } = decoded;

      // Verify user existence in DB based on role
      let userExists = null;
      if (role === "ADMIN") {
        userExists = await prisma.admin.findUnique({ where: { id } });
      } else if (role === "TEACHER") {
        userExists = await prisma.teacher.findUnique({ where: { id } });
      } else if (role === "PARENT") {
        userExists = await prisma.parent.findUnique({ where: { id } });
      } else if (role === "STUDENT") {
        userExists = await prisma.student.findUnique({ where: { id } });
      }

      if (!userExists) {
        throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
      }

      if (requiredRoles.length && !requiredRoles.includes(role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You do not have permission to access this resource"
        );
      }

      req.user = decoded as JwtPayload & {
        id: string;
        role: string;
        username: string;
      };
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
