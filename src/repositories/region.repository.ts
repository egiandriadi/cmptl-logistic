import { PrismaClient } from "prisma/prisma-client";
import prisma from "../databases/prisma";
import RegionRepositoryInterface from "./region.repository.interface";

export default class RegionRepository implements RegionRepositoryInterface {
  protected model: PrismaClient["m_wilayah"];

  constructor() {
    this.model = prisma.m_wilayah;
  }

  public async getById(id: number) {
    return await this.model.findFirst({
      where: {
        id,
      },
    });
  }

  public async getByName(city: string, district: string) {
    return await this.model.findFirst({
      where: {
        kabupaten_kota: city,
        name: district
      },
    });
  }
}
