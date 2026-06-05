import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

export const prisma =
  tursoUrl && tursoUrl.startsWith("libsql://")
    ? new PrismaClient({
        adapter: new PrismaLibSQL({
          url: tursoUrl,
          authToken: tursoAuthToken,
        }),
      })
    : new PrismaClient();
