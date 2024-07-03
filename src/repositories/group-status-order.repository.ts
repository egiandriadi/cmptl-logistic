import { PrismaClient } from "prisma/prisma-client";
import prisma from "../databases/prisma";
import GroupStatusOrderRepositoryInterface from "./group-status-order.repository.interface";

export default class GroupStatusOrderRepository implements GroupStatusOrderRepositoryInterface {

  protected model : PrismaClient["m_group_status_order"];

  constructor() {
    this.model  = prisma.m_group_status_order;
  }

  async getJneMasterStatus(group_status_id : number, expeditionId : number) : Promise<any>{
    return await this.model.findFirst({
      where : {
        group_status_id : group_status_id,
        m_status_order : {
          ekspedisi_id: expeditionId,
          ekspedisi_code : null
        }
      },
      include : {
        m_status_order: true
      }
    })
  }

}