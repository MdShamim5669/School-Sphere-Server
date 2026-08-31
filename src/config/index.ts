import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_round: Number(process.env.BCRYPT_SALT_ROUND) || 12,
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET || "default_access_secret",
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
    refresh_secret: process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
};
