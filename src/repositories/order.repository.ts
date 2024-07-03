import { PrismaClient } from "prisma/prisma-client";
import OrderRepositoryInterface from "./order.repository.interface";
import prisma from "../databases/prisma";

export default class OrderRepository implements OrderRepositoryInterface {
  model : PrismaClient["order"];

  constructor() {
    this.model    = prisma.order;
  }

  async getByNomorOrder(nomor : string) {
    return await this.model.findFirst({
      where : {
        nomor_order : nomor
      }
    })
  }

  async getByUUIDs( UUIDs: string[],
                    ekspedisiId : number ): Promise<any> {
    return await this.model.findMany({
      where: {
        uuid: {
          in: UUIDs
        },
        nomor_resi: {
          not: null
        },
        ekspedisi_id: ekspedisiId,
      }
    })
  }

  public async getForCancelOrders(uuids: string[], expeditionCode: string): Promise<any> {
    return await this.model.findMany({
      where: {
        uuid: { in: uuids },
        nomor_resi: { not: null },
        m_ekspedisi: {
          code: expeditionCode,
        },
      },
    });
  }

  public async updateStatusMany(uuids: string[], statusName: string) {
    const status = await prisma.m_status_order.findFirst({
      where: {
        name: statusName,
      },
    });

    return await this.model.updateMany({
      where: {
        uuid: { in: uuids },
      },
      data: {
        status_order_id: status?.id,
      },
    });
  }

  public async updateStatus(id: number, statusName: string) {
    const status = await prisma.m_status_order.findFirst({
      where: {
        name: statusName,
      },
    });

    return await this.model.update({
      where: {
        id: id,
      },
      data: {
        status_order_id: status?.id,
      },
    });
  }

  public async getByAwbAndExpeditionCode(awb: string, expeditionCode: string) {
    return await this.model.findFirst({
      where: {
        nomor_resi: awb,
        m_ekspedisi: {
          code: expeditionCode,
        },
      },
    })
  }
}
