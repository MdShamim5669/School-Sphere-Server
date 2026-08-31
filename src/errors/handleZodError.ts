import { ZodError } from "zod";
import httpStatus from "http-status";
import { TErrorSources, TGenericErrorResponse } from "../interface/error.js";

export const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSources = err.issues.map((issue) => {
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    };
  });

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: "Validation Error",
    errorSources,
  };
};
