import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";
import globalErrorHandler from "./middlewares/globalErrorhandler.js";
import notFound from "./middlewares/notFound.js";

const app: Application = express();

// Allowed origins for CORS (Local development + Vercel deployment)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://school-sphere-five.vercel.app",
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((u) => u.trim()) : []),
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((u) => u.trim()) : []),
];

// Parsers & Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost");

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
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
