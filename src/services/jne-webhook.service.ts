import _ from "lodash";
import { genUUID } from "../helper";
import WebhookRequestInterface from "../libs/webhook/webhook-request.interface";
import { CreateStatusOrderDto } from "../repositories/dto/create-status-order.dto";
import EkspedisiRepository from "../repositories/ekspedisi.repository";
import StatusOrderRepository from "../repositories/status-order.repository";
import { WebhookServices } from "./webhook.service";
import moment from "moment";

export default class JneWebhookService extends WebhookServices {

  async findOrCreateStatusOrder (webhookDto : WebhookRequestInterface) : Promise<number> {
    const ekspedisiRepository  = new EkspedisiRepository();
    const ekspedisiModel  = await ekspedisiRepository.findByCode(webhookDto.expedition_code);
    if (!ekspedisiModel) throw new Error("Ekspedisi tidak ditemukan.");
    const statusOrderRepository = new StatusOrderRepository();
    
    const { history } = webhookDto.payload; 
    const latestHistory = _.head(_.orderBy(history, [item => moment(item.date).unix()], ['desc']));
    console.log("🚀 ~ file: jne-webhook.service.ts:36 ~ JneWebhookService ~ findOrCreateStatusOrder ~ latestHistory: " + JSON.stringify(latestHistory));
    const statusDesc = latestHistory.status_desc.trim();
    const statusCode = latestHistory.status_code.trim();
    let statusOrderModel = await statusOrderRepository.getJneStatus(statusDesc, statusCode, ekspedisiModel.id);
    if (!statusOrderModel) {
      const dataCreateStatus: CreateStatusOrderDto = {
        name: statusDesc,
        uuid: genUUID(),
        ekspedisi_id: ekspedisiModel.id,
        ekspedisi_code: statusCode
      }
      statusOrderModel = await statusOrderRepository.create(dataCreateStatus);
    };

    return statusOrderModel.id;
  }

}