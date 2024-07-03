import { NextFunction, Request, Response } from "express";
import { WebhookServices } from "../services/webhook.service";
import { PrismaClient } from "prisma/prisma-client";
import SapWebhookRequestDto from "../services/sap/dto/webhook-request.dto";
import { RequestWebhookDto } from "../services/idexpress/dto/request-webhook.dto";
import { EXPEDITION_IDEXPRESS_CODE } from "../services/idexpress/constans";
import JneWebhookRequestDto from "../services/jne/dto/webhook-request.dto";
import JneWebhookService from "../services/jne-webhook.service";
import moment from "moment";

const prisma = new PrismaClient();

export class WebhookController {
  static ninja = async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;
    try {
      const searchOrder = await WebhookServices.findOrder(body.tracking_id);

      if (!searchOrder) throw new Error("Unkown data");

      await WebhookServices.insertLog(
        body,
        searchOrder.id,
        body.tracking_id,
        "ninja"
      );

      const lastUpdate = moment(body.timestamp).format("YYYY-MM-DD HH:mm:ss");
      const statusLog = await WebhookServices.searchOrInsertStatus(body.status);
      const isCanUpdateStatus = WebhookServices.canUpdateStatusOrder(searchOrder.last_update, lastUpdate);

      if (isCanUpdateStatus) {
        const updateOrder = await WebhookServices.updateOrderStatusOrder(
          searchOrder.id,
          statusLog,
          lastUpdate
        );

        if (!updateOrder) throw new Error("Cannot Update Status Order");
      }

      return res.json(req.body);
    } catch (error: any) {
      return res.status(400).json({
        status: 400,
        message: error.message,
      });
    }
  };

  static idexpress = async (req: Request, res: Response) => {
    const value = req.body;

    try {
      const lastIndex = value.length - 1;
      const item = value[lastIndex];
      const webhookDto: RequestWebhookDto = {
        awb: item.waybillNo,
        expedition_code: EXPEDITION_IDEXPRESS_CODE,
        status: item.operationType,
        timestamp: moment.unix(item.lastOperationTime).format("YYYY-MM-DD HH:mm:ss"),
        payload: item,
      };
      const webhookService = new WebhookServices();
      await webhookService.updateStatus(webhookDto);

      return res.status(200).json({
        status: 200,
        message: "Success",
      });
    } catch (error: any) {
      return res.status(400).json({
        status: 400,
        message: error.message,
      });
    }
  };

  static sap = async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;
    try {
      const webhookDto = SapWebhookRequestDto.hydrate(body);
      const webhookService = new WebhookServices();
      await webhookService.updateStatus(webhookDto);
      return res.status(200).json({
        status: 200,
        message: "Success",
      });
    } catch (err) {
      const error = err as Error;
      return res.status(500).json({
        status: false,
        reason: error.message
      })
    }
  };

  static jne = async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;
    try {
      const webhookDto = JneWebhookRequestDto.hydrate(body);
      const webhookService = new JneWebhookService();
      await webhookService.updateStatus(webhookDto);
      return res.status(200).json({
        status: true
      });
    } catch (err) {
      const error = err as Error;
      return res.status(500).json({
        status: false,
        reason: error.message
      })
    }
  }
}
