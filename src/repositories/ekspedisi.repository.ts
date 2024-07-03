import { PrismaClient } from "prisma/prisma-client";
import prisma from "../databases/prisma";
import EkspedisiRepositoryInterface from "./ekspedisi.repository.interface";

export default class EkspedisiRepository implements EkspedisiRepositoryInterface {

  protected model : PrismaClient["m_ekspedisi"];
  protected model_layanan_ekspedisi : PrismaClient["layanan_ekspedisi"];

  constructor() {
    this.model  = prisma.m_ekspedisi;
    this.model_layanan_ekspedisi  = prisma.layanan_ekspedisi;
  }

  async findByCode(code: string) {
    return await this.model.findFirst({
      where: { 
        code: code
      },
    })
  }

  async findLayanan(code: string, serviceType: string) {
    const ekspedisi = await this.model.findFirst({
      where: { 
        code: code
      },
    })
    const layanan = await this.model_layanan_ekspedisi.findFirst({
      where: { 
        code: serviceType,
        ekspedisi_id: ekspedisi?.id
      }, 
    });
    const dataLayanan = {
      ekspedisi_name: ekspedisi?.name,
      ekspedisi_description: ekspedisi?.description,
      ekspedisi_code: ekspedisi?.code,
      ekspedisi_logo: ekspedisi?.logo,
      ekspedisi_id: ekspedisi?.id,
      layanan_ekspedisi_id: layanan?.id,
    }
    return dataLayanan;
  }

}