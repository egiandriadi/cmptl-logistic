import { PrismaClient } from "prisma/prisma-client";
import OrderHistoryRepositoryInterface from "./order-history.repository.interface";

export default class OrderHistoryRepository implements OrderHistoryRepositoryInterface {
  model: PrismaClient["m_riwayat_order"];

  constructor() {
    this.model = prisma.m_riwayat_order;
  }

  public async countOrderScoring(expeditionCode: string, zipcode: string, status: string): Promise<any> {
    return await this.model.aggregate({
      _count: {
        status: true,
      },
      where: {
        ekspedisi: expeditionCode,
        kode_pos: zipcode,
        status: status,
      },
    });
  }
}