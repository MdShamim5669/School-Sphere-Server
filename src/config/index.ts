import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const rawDbUrl = (
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_ZMHWD6Swl1zb@ep-soft-snow-aeg3io1e-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
).replace(/^['"]|['"]$/g, "");

process.env.DATABASE_URL = rawDbUrl;

export default {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT ? Number(process.env.PORT) : 5000,
  database_url: rawDbUrl,
  bcrypt_salt_round: process.env.BCRYPT_SALT_ROUND
    ? Number(process.env.BCRYPT_SALT_ROUND)
    : 12,
  jwt: {
    access_secret:
      process.env.JWT_ACCESS_SECRET || "O3o3T4CxiEkOJzASlWzQDGweKv9ufMaZ",
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
    refresh_secret:
      process.env.JWT_REFRESH_SECRET ||
      "k17fhKD8bGBJP5bpf00eB7__nDDkNcxKmjXs3-iq-OI",
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "shamcloud",
    api_key: process.env.CLOUDINARY_API_KEY || "853723273146754",
    api_secret:
      process.env.CLOUDINARY_API_SECRET || "DxcbKL2wLVa6lei5PyOsCSb8gEk",
  },
  admin_username: process.env.ADMIN_USERNAME || "admin",
  admin_password: process.env.ADMIN_PASSWORD || "Password123!",
};
