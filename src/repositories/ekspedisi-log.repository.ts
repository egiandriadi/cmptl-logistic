import EkspedisiLogRepositoryInterface from "./ekspedisi-log.repository.interface";
import { PrismaClient } from "prisma/prisma-client";
import prisma from "../databases/prisma";

export default class EkspedisiLogRepository implements EkspedisiLogRepositoryInterface {

  protected model: PrismaClient["ekspedisi_log"];

  constructor() {
    this.model = prisma.ekspedisi_log;
  }

  async getByAwb(expeditionCode : string, awb : string) : Promise<any> {
    return await this.model.findMany({
      where : {
        ekspedisi: expeditionCode,
        airwaybill_number : awb
      }
    })
  }

}