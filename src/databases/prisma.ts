import { PrismaClient } from "@prisma/client";
import { readReplicas } from "@prisma/extension-read-replicas";
import config from "../config/global.config";

declare global {
  var prisma: PrismaClient;
}

if (!global.prisma) {
  global.prisma = new PrismaClient({
    log: ["query", "error", "info", "warn"],
  });
  global.prisma.$extends(
    readReplicas({
      url: config.DATABASE_READER_URL!,
    })
  );
}

export default global.prisma;
