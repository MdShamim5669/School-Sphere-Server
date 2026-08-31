import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import { TErrorSources, TGenericErrorResponse } from "../interface/error.js";

export const handlePrismaValidationError = (
  err: Prisma.PrismaClientValidationError
): TGenericErrorResponse => {
  const errorSources: TErrorSources = [
    {
      path: "",
      message: err.message,
    },
  ];

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: "Prisma Validation Error",
    errorSources,
  };
};
