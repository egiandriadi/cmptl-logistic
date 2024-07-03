import { PrismaClient, m_flat_rates, region_flat_rates } from "prisma/prisma-client";
import prisma from "../databases/prisma";
import FlatRateInterface from "./flat-rate.repository.interface";
import { DateTime } from "luxon";

export default class FlatRateRepository implements FlatRateInterface {
  protected model: PrismaClient["m_flat_rates"];
  protected nowISO = DateTime.now().toISO();

  constructor() {
    this.model = prisma.m_flat_rates;
  }

  public async getByExpeditionCodeAndService(expeditionCode: string, expeditionService: string): Promise<[] | m_flat_rates[]> {
    return await this.model.findMany({
      where: {
        ekspedisi_code: expeditionCode,
        ekspedisi_service: expeditionService,
        start_at: {
          lte: this.nowISO,
        },
        end_at: {
          gte: this.nowISO,
        },
        is_active: true,
      },
      orderBy: {
        amount: "asc",
      },
      include: {
        region_flat_rates: true,
      },
    });
  }
}
