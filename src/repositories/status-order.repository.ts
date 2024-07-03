import { PrismaClient } from "prisma/prisma-client";
import prisma from "../databases/prisma"
import StatusOrderRepositoryInterface from "./status-order.repository.interface";
import { CreateStatusOrderDto } from "./dto/create-status-order.dto";

export default class StatusOrderRepository implements StatusOrderRepositoryInterface {
  protected model: PrismaClient["m_status_order"];

  constructor() {
    this.model = prisma.m_status_order;
  }
  
  public async create(data: CreateStatusOrderDto) {
    return await this.model.create({
      data: data,
    });
  }

  public async getByName(statusName: string) {
    return await this.model.findFirst({
      where: {
        name: statusName,
      },
    });
  }

  async findByNames(name: string[], ekspedisiId : number) {
    return await this.model.findMany({
      where: {
        name: {
          in: name,
        },
        ekspedisi_id: ekspedisiId
      },
    });
  }

  async findByName(name: string): Promise<any> {
    return await this.model.findFirst({
      where: {
        name: name,
      },
    });
  }

  public async getByNameAndExpeditionId(statusName: string, expeditionId: number) : Promise<any> {
    return await this.model.findFirst({
      where: {
        name: statusName,
        ekspedisi_id: expeditionId,
      },
    });
  }

  public async getJneStatus(statusName: string, statusCode: string, expeditionId: number) : Promise<any>  {
    return await this.model.findFirst({
      where: {
        name: statusName,
        ekspedisi_code: statusCode,
        ekspedisi_id: expeditionId
      }
    })
  }

  public async getByEkspedisiCodeAndId(expeditionCode : string, expeditionId : number) {
    return await this.model.findFirst({
      where: {
        ekspedisi_code: expeditionCode,
        ekspedisi_id: expeditionId
      },
      include: {
        m_group_status_order: true
      }
    });
  }

}
