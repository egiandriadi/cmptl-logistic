import { PrismaClient } from "@prisma/client";
import { parseArgs } from "util";
import { Mutex } from "async-mutex";
import { WebhookServices } from "../src/services/webhook.service";

const prisma = new PrismaClient();

async function main() {
  const { values: { name } } = parseArgs({
    options: {
      name: {
        type: "string",
        short: "n",
      },
    },
  });

  console.log(`🚀 Start Seeding: ${name}`);

  if (name) await callFunctionByName(name);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

async function callFunctionByName(name: string) {
  switch (name) {
    case 'MigrationFailureReasonSeeder':
      return await MigrationFailureReasonSeeder(prisma);
    default:
      console.error(`Function ${name} not found.`);
  }
}

// function ini sementara disini dulu, harusnya dibuatkan folder sendiri ./prisma/seeders/
async function MigrationFailureReasonSeeder(prisma: PrismaClient) {
  const mutex = new Mutex();
  let next = true;
  let lastEkspedisiLogId = 0;
  while (next) {
    const dataLogs = await prisma.ekspedisi_log.findMany({
      where: {
        id: { gt: lastEkspedisiLogId },
      },
      take: 10000,
    });

    if (dataLogs.length === 0) {
      next = false;
      return;
    }

    lastEkspedisiLogId = dataLogs.pop()?.id ?? 0;

    await Promise.all(dataLogs.map(async (log: any, index) => {
      const rawParsed = JSON.parse(log.raw);
      const release = await mutex.acquire();
      if (index % 1000 === 0) process.stdout.write(".");

      try {
        await WebhookServices.insertFailureReason(parseInt(log.order_id), log.ekspedisi, rawParsed);
      } catch (error) {
        console.log(error);
      } finally {
        release();
      }
    }));
  }

  console.log(`✅ Seeding: Migration failure reason done.`);
};