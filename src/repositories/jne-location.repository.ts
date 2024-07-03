import { PrismaClient } from "prisma/prisma-client";
import prisma from "../databases/prisma";
import JneLocationRepositoryInterface from "./jne-location.repository.interface";

export default class JneLocationRepository implements JneLocationRepositoryInterface {
  protected model: PrismaClient["m_jne_locations"];

  constructor() {
    this.model = prisma.m_jne_locations;
  }

  public async getByZipCode(zipCode: string | null) {
    return await this.model.findFirst({
      where: {
        zipcode: zipCode,
      },
    });
  }
}
