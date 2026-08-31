import { Server } from "http";
import app from "./app.js";
import config from "./config/index.js";
import prisma from "./lib/prisma.js";

let server: Server;

async function bootstrap() {
  try {
    server = app.listen(config.port, () => {
      console.log(`🚀 School Sphere Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }

  const exitHandler = () => {
    if (server) {
      server.close(async () => {
        console.log("Server closed.");
        await prisma.$disconnect();
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  const unexpectedErrorHandler = (error: unknown) => {
    console.error("Unexpected error:", error);
    exitHandler();
  };

  process.on("uncaughtException", unexpectedErrorHandler);
  process.on("unhandledRejection", unexpectedErrorHandler);

  process.on("SIGTERM", () => {
    console.log("SIGTERM received");
    if (server) {
      server.close();
    }
  });
}

bootstrap();
