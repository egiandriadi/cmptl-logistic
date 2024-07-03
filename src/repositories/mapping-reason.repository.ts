import { PrismaClient } from "prisma/prisma-client";
import MappingReasonRepositoryInterface from "./mapping-reason.repository.interface";

export default class MappingReasonRepository implements MappingReasonRepositoryInterface {
  model: PrismaClient["m_mapping_reasons"];

  constructor() {
    this.model = prisma.m_mapping_reasons;
  }

  async getByEkspedisiCode(ekspedisiCode: string): Promise<any> {
    return await this.model.findMany({
      where: {
        ekspedisi_code: ekspedisiCode,
      },
      include: {
        reason: true
      },
    });
  }

}