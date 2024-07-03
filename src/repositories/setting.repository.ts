import { PrismaClient } from "prisma/prisma-client";
import prisma from "../databases/prisma";
import SettingRepositoryInterface from "./setting.repository.interface";

export default class SettingRepository implements SettingRepositoryInterface {

  model : PrismaClient["m_sap_locations"];

  constructor() {
    this.model  = prisma.m_sap_locations;
  }

}