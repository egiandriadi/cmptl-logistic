import { NextFunction, Request, Response } from "express";
import { StatusServices } from "../services/status/status.service";
import { EXPEDITION_CODE } from "../constants/expedition-code";
import { StatusOrderLog } from "../services/status/dto/status.dto";
import { ORDER_STATUS_NINJA } from "../constants/status-code";
import _ from "lodash";

export class StatusOrderController {
  static statusOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { order_id } = req.params;

    const orderData = await StatusServices.getOrderData(order_id);

    if (!orderData.length) {
      return res.json({
        status: false,
        message: "Cannot find Order Data",
      });
    } else {
      const firstIndex = 0;
      const logisticLogs = await StatusServices.getLogisticData(
        orderData[firstIndex].nomor_resi
      );
      const trackingData: any[] = _.uniqBy(logisticLogs, "raw");
      let raw = [];

      for (let td of trackingData) {
        let statusOrderLog: StatusOrderLog;

        if (td.ekspedisi === EXPEDITION_CODE.NINJA) {
          statusOrderLog = StatusServices.mapStatusLogNinja(td);
        } else if (td.ekspedisi === EXPEDITION_CODE.IDEXPRESS) {
          statusOrderLog = StatusServices.mapStatusLogIdexpress(td);
        } else if (td.ekspedisi === EXPEDITION_CODE.SAP) {
          statusOrderLog = StatusServices.mapStatusLogSap(td);
        } else if (td.ekspedisi === EXPEDITION_CODE.JNE) {
          statusOrderLog = StatusServices.mapStatusLogJne(td);
        } else {
          return;
        }

        raw.push(statusOrderLog);
      }
      Object.assign(orderData[0], {
        total_customer_receive: Math.ceil(
          orderData[0].nilai_cod -
            orderData[0].tarif -
            orderData[0].fee_cod +
            orderData[0].discount
        ),
      });
      return res.json({
        status: true,
        message: "Success Fetch data",
        data: orderData[0],
        log: raw,
      });
    }
  };
}
