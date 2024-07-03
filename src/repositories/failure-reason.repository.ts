import { PrismaClient } from "prisma/prisma-client";
import FailureReasonRepositoryInterface from "./failure-reason.repository.interface";
import { CreateFailureReasonDto } from "./dto/create-failure-reason.dto";

export default class FailureReasonRepository implements FailureReasonRepositoryInterface {
  model: PrismaClient["t_failure_reasons"];

  constructor() {
    this.model = prisma.t_failure_reasons;
  }
  async create(data: CreateFailureReasonDto): Promise<any> {
    return await this.model.create({
      data: data,
    });
  }
}