import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";
import globalErrorHandler from "./middlewares/globalErrorhandler.js";
import notFound from "./middlewares/notFound.js";

const app: Application = express();

// Parsers & Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "School Sphere Backend API is running successfully!",
  });
});

// Application Routes
app.use("/api/v1", router);

// Error Handling Middlewares
app.use(globalErrorHandler);
app.use(notFound);

export default app;
