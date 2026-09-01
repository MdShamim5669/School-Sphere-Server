import bcrypt from "bcryptjs";
import config from "../config/index.js";
import prisma from "../lib/prisma.js";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await prisma.admin.findUnique({
      where: {
        username: config.admin_username,
      },
    });

    if (!isSuperAdminExist) {
      const hashedPassword = await bcrypt.hash(
        config.admin_password,
        config.bcrypt_salt_round
      );

      await prisma.admin.create({
        data: {
          username: config.admin_username,
          password: hashedPassword,
        },
      });

      console.log(
        `🛡️  Default Admin created successfully -> Username: "${config.admin_username}", Password: "${config.admin_password}"`
      );
    }
  } catch (error) {
    console.error("❌ Failed to seed default admin:", error);
  }
};
