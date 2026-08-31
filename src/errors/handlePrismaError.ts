import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import { TErrorSources, TGenericErrorResponse } from "../interface/error.js";

export const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError
): TGenericErrorResponse => {
  let statusCode: number = httpStatus.BAD_REQUEST;
  let message = "Prisma Database Error";
  let errorSources: TErrorSources = [
    {
      path: "",
      message: err.message,
    },
  ];

  if (err.code === "P2002") {
    statusCode = httpStatus.CONFLICT;
    const target = (err.meta?.target as string[]) || [];
    message = `Unique constraint failed on field(s): ${target.join(", ")}`;
    errorSources = [
      {
        path: target.join(", "),
        message,
      },
    ];
  } else if (err.code === "P2025") {
    statusCode = httpStatus.NOT_FOUND;
    message = (err.meta?.cause as string) || "Record not found";
    errorSources = [
      {
        path: "",
        message,
      },
    ];
  } else if (err.code === "P2003") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Foreign key constraint violation";
    errorSources = [
      {
        path: (err.meta?.field_name as string) || "",
        message,
      },
    ];
  }

  return {
    statusCode,
    message,
    errorSources,
  };
};
