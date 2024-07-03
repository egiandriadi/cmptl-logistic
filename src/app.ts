// ensure global timezone set to UTC
process.env.TZ = "UTC";

import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import routes from "./routes/route";
import DatabaseConfig from "./typeorm.config";
import * as dotenv from "dotenv";
import config from "./config/global.config";
import errorMiddleware from "./middleware/error.middleware";
import { NinjaController } from "./controller/ninja.controller";
import * as cron from "node-cron";
dotenv.config();

const app = express();
const port = config.port || 3000;

DatabaseConfig.initialize()
  .then(async () => {
    console.log("🚀 DATABASE RUNNING WELL");
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    /** Health Check */
    app.use('/health', (req: Request, res: Response) => {
      return res.status(200).json({
        statusCode: 200,
        success: true,
        message: 'OK'
      })
    })

    app.use("/v1/api", routes);
    app.use(errorMiddleware);
    // await NinjaController.generateToken();
    app.listen(port, () => {
      console.log(`Server berjalan di http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.log("Something wrong with database connection");
    console.log(error);
  });

// Solution for serialize a BigInt 
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
  return this.toString();
};