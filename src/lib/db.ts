import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { getDatabaseEnv } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const { DATABASE_URL } = getDatabaseEnv();
  const adapter = new PrismaPg({
    connectionString: DATABASE_URL,
    max: 3,
  });

  return new PrismaClient({ adapter });
}

export function getDb() {
  globalForPrisma.prisma ??= createPrismaClient();

  return globalForPrisma.prisma;
}
