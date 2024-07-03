import { PrismaClient } from "prisma/prisma-client";
import SapLocationRepositoryInterface from "./sap-location.repository.interface";
import prisma from "../databases/prisma";

export default class SapLocationRepository implements SapLocationRepositoryInterface {

  model : PrismaClient["m_sap_locations"];

  constructor() {
    this.model  = prisma.m_sap_locations;
  }

  async getByWilayahCode(wilayahCode: string) {
    return await this.model.findFirst({
      where : {
        m_wilayah_code : wilayahCode
      }
    })
  }

  async getByZipcode(zipcode: string) {
    return await this.model.findFirst({
      where : {
        zipcode : zipcode
      }
    })
  }

  

}