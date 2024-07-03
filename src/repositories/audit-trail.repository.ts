import { PrismaClient } from "prisma/prisma-client";
import prisma from "../databases/prisma";
import AuditTrailRepositoryInterface from "./audit-trail.repository.interface";
import { CreateAuditTrailDto } from "./dto/create-audit-trail.dto";
import { UpdateLogsAuditTrailDto } from "./dto/update-logs-audit-trail.dto";

export default class AuditTrailRepository implements AuditTrailRepositoryInterface {
  protected model: PrismaClient["audit_trail"];

  constructor() {
    this.model = prisma.audit_trail;
  }

  public async create(data: CreateAuditTrailDto) {
    return await this.model.create({
      data: data,
    });
  }

  public async updateLogsById(id: number, data: UpdateLogsAuditTrailDto) {
    return await this.model.update({
      where: {
        id: id,
      },
      data: data,
    });
  }
}
