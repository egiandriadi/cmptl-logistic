import { PrismaClient } from "prisma/prisma-client";
import prisma from "../databases/prisma";
import IdexpressLocationRepositoryInterface from "./idexpress-location.repository.interface";

export class IdexpressLocationRepository implements IdexpressLocationRepositoryInterface {
  protected model: PrismaClient["m_idexpress_locations"];

  constructor() {
    this.model = prisma.m_idexpress_locations;
  }

  public async getByZipCode(zipCode: string = "0") {
    return await this.model.findFirst({
      where: {
        zipcode: zipCode,
      },
    });
  }

  public async getByZipCodeAndCod(zipCode: string = "0", isCod: boolean = false) {
    return await this.model.findFirst({
      where: {
        zipcode: zipCode,
        cod_coverage: isCod,
      },
    });
  }

  public async getByRegionId(regionId: number = 0) {
    return await this.model.findFirst({
      where: {
        wilayah_id: regionId,
      },
    });
  }

  public async getByRegionIdAndCodStandard(regionId: number = 0, isCod: boolean = false) {
    return await this.model.findFirst({
      where: {
        wilayah_id: regionId,
        cod_coverage: isCod,
      },
    });
  }

  public async getByRegionIdAndCodLite(regionId: number = 0, isCod: boolean = false) {
    return await this.model.findFirst({
      where: {
        wilayah_id: regionId,
        cod_coverage_lite: isCod,
      },
    });
  }

  public async getByRegionIdAndCodCargo(regionId: number = 0, isCod: boolean = false) {
    return await this.model.findFirst({
      where: {
        wilayah_id: regionId,
        cod_coverage_cargo: isCod,
      },
    });
  }
}
