import { PrismaClient } from "prisma/prisma-client";
import UserRepositoryInterface from "./user.repository.interface";
import prisma from "../databases/prisma";

export default class UserRepository implements UserRepositoryInterface {
  model : PrismaClient["user"];

  constructor() {
    this.model    = prisma.user;
  }

  async getById(id : number) {
    return await this.model.findFirst({
      where : {
        id,
      }
    })
  }
}
