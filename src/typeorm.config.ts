import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import config from "./config/global.config";
dotenv.config();

const DatabaseConfig = new DataSource({
  type: "mysql",
  host: config.database.host,
  port: Number(config.database.port),
  username: config.database.user,
  password: config.database.password,
  database: config.database.dbname,
  entities: [__dirname + "/./entities/**/*.{js,ts}"],
  migrations: [path.join(__dirname, "./migrations/*")],
  logging: true,
  synchronize: false,
});
export default DatabaseConfig;
