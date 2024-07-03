import { EXPEDITION_CODE } from "../constants/expedition-code";
import { ORDER_STATUS_IDEXPRESS, ORDER_STATUS_NINJA, ORDER_STATUS_SAP } from "../constants/status-code";
import { EkspedisiLog } from "../entity/ekspedisi_log.entity";
import { genUUID } from "../helper";
import WebhookRequestInterface from "../libs/webhook/webhook-request.interface";
import { CreateStatusOrderDto } from "../repositories/dto/create-status-order.dto";
import EkspedisiRepository from "../repositories/ekspedisi.repository";
import MappingReasonRepository from "../repositories/mapping-reason.repository";
import OrderRepository from "../repositories/order.repository";
import StatusOrderRepository from "../repositories/status-order.repository";
import DatabaseConfig from "../typeorm.config";
import axios, { AxiosError } from "axios";
import moment from 'moment';
import FailureReasonRepository from "../repositories/failure-reason.repository";
import { CreateFailureReasonDto } from "../repositories/dto/create-failure-reason.dto";
import { JNE_FAILURE_POD_CODES } from "./jne/constans";
import { removeExtraSpaces } from "../helpers/string.helper";

export const EXPEDITION_LOG_TYPE = {
  WEBHOOK : 'webhook',
  TRACK : 'track'
}
export class WebhookServices {
  static findOrder = async (resi: string) => {
    const dataSourceManager = DatabaseConfig.manager;

    const find = await dataSourceManager.query(
      "SELECT * FROM `order` WHERE nomor_resi = ? LIMIT 1",
      [resi]
    );
    return find[0];
  };
  static insertLog = async (
    data: any,
    orderId: string,
    resi: string,
    ekspedisiName: string,
    createdBy : string = EXPEDITION_LOG_TYPE.WEBHOOK,
    createdAt : number = moment().unix()
  ) => {
    const dataSourceManager = DatabaseConfig.manager;

    console.debug(`createdAt:${createdAt}`);
    const createdAtDt = moment.unix(createdAt).format("YYYY-MM-DD HH:mm:ss")
    console.debug(`createdAtDt:${createdAtDt}`);
    const insert = await dataSourceManager.query(
      "INSERT INTO ekspedisi_log (order_id, ekspedisi, airwaybill_number, raw, uuid, created_by, created_at, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [orderId, ekspedisiName, resi, JSON.stringify(data), genUUID(), createdBy, createdAtDt, createdBy]
    );
    if (!insert.insertId) throw new Error("Cannot Insert into log");

    this.insertFailureReason(Number(orderId), ekspedisiName, data);

    return insert.insertId;
  };
  static searchOrInsertStatus = async (status: string) => {
    const ekspedisiRepository  = new EkspedisiRepository();
    const ekspedisiModel = await ekspedisiRepository.findByCode(EXPEDITION_CODE.NINJA);
    const dataSourceManager = DatabaseConfig.manager;

    const checkBefore = await dataSourceManager.query(
      "SELECT * FROM `m_status_order` WHERE name = ? AND ekspedisi_id = ? LIMIT 1",
      [status, ekspedisiModel?.id]
    );
    console.log(
      "🚀 ~ file: webhook.service.ts:36 ~ WebhookServices ~ searchOrInsertStatus= ~ checkBefore:",
      checkBefore
    );

    if (checkBefore.length > 0) {
      return checkBefore[0].id;
    } else {
      const insertBefore = await dataSourceManager.query(
        "INSERT INTO `m_status_order` (uuid, name, ekspedisi_id) VALUES (?,?,?)",
        [genUUID(), status, ekspedisiModel?.id]
      );
      if (!insertBefore.insertId) throw new Error("cannot mapping status");
      return insertBefore.insertId;
    }
  };

  async updateStatus(
    webhookDto : WebhookRequestInterface, 
    updateStatus = true, 
    updateType : string = EXPEDITION_LOG_TYPE.WEBHOOK, 
    createdAt : number = moment().unix(),
    isInsertLog : boolean = true
  ) : Promise<boolean> {

    const orderRepository = new OrderRepository();

    const order = await orderRepository.getByAwbAndExpeditionCode(webhookDto.awb, webhookDto.expedition_code);

    if (!order) throw new Error("Unknown data");

    const orderId = order.id.toString();

    if (isInsertLog) {
      await WebhookServices.insertLog(
        webhookDto.payload,
        orderId,
        webhookDto.awb,
        webhookDto.expedition_code,
        updateType,
        createdAt
      );
    }

    const statusId : number = await this.findOrCreateStatusOrder(webhookDto);

    if (updateStatus) {
      const updateOrder = await WebhookServices.updateOrderStatusOrder(
        order.id,
        statusId,
        webhookDto.timestamp
      );
      if (!updateOrder) throw new Error("Cannot Update Status Order");
    }

    return true;
  }

  async findOrCreateStatusOrder (webhookDto : WebhookRequestInterface) : Promise<number> {
    const ekspedisiRepository  = new EkspedisiRepository();
    const ekspedisiModel  = await ekspedisiRepository.findByCode(webhookDto.expedition_code);
    if (!ekspedisiModel) throw new Error("Ekspedisi tidak ditemukan.");
    const statusOrderRepository = new StatusOrderRepository();
    
    let statusOrderModel = await statusOrderRepository.getByNameAndExpeditionId(webhookDto.status, ekspedisiModel.id);
    
    if (!statusOrderModel) {
      const dataCreateStatus: CreateStatusOrderDto = {
        name: webhookDto.status.trim(),
        uuid: genUUID(),
        ekspedisi_id: ekspedisiModel.id,
      }
      statusOrderModel = await statusOrderRepository.create(dataCreateStatus);
    };

    return statusOrderModel.id;
  }

  static updateOrderStatusOrder = async (id: number, status_order: number, lastUpdate: string) => {
    const dataSourceManager = DatabaseConfig.manager;
    const updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
    
    const update = await dataSourceManager.query(
      "UPDATE `order` SET `status_order_id` = ?, `updated_at` = ?, `last_update` = ? WHERE `id` = ?",
      [status_order, updatedAt, lastUpdate, id]
    );
    return update.affectedRows;
  };

  /**
   * Check if can update status order
   * @param lastUpdateOrder format YYYY-MM-DD HH:mm:ss
   * @param timestampExpedition format YYYY-MM-DD HH:mm:ss
   * @returns boolean
   */
  static canUpdateStatusOrder = (lastUpdateOrder: string, timestampExpedition: string) => {
    const dateLastUpdateOrder = moment(lastUpdateOrder, "YYYY-MM-DD HH:mm:ss");
    const dateTimestampExpedition = moment(timestampExpedition, "YYYY-MM-DD HH:mm:ss");

    if (dateLastUpdateOrder.isAfter(dateTimestampExpedition)) return false;

    return true;
  }

  static sendWhatsapp = async (mobile: string, message: string) => {
    let data = JSON.stringify({
      "receiver": mobile,
      "text": message
    });
    const url = `${process.env.WHATSAPP_BASE_URL}/api/integration/whatsapp/v1/message/text`;
    
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: url,
      headers: { 
        'X-Whatsapp-Token': `${process.env.WHATSAPP_API_KEY}`, 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${process.env.WHATSAPP_COMPANY_TOKEN}`
      },
      data : data
    };

    axios.request(config)
    .then((response) => {
      console.log('Response', response.data);
      return response.data;
    })
    .catch((error) => {
      console.log('<== ERROR WA ==>', error)
      // throw new HttpException('Failed to send WhatsApp message', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  }

  public static async insertFailureReason(orderId: number, expeditionCode: string, log: any) {
    try {
      let failureReason = this.checkFailureReason(expeditionCode, log);

      if (failureReason) {
        failureReason = removeExtraSpaces(failureReason);
        const mappingReasonRespository = new MappingReasonRepository();
        const failureReasonRepository = new FailureReasonRepository();

        const mappingReasons = await mappingReasonRespository.getByEkspedisiCode(expeditionCode);
        const matchedReason = mappingReasons.filter( (reason: any) => failureReason.includes(reason.failure_reason));
        const reasonId = matchedReason.length > 0 ? matchedReason.shift().reason.id : null;
        const dataCreateFailureReason: CreateFailureReasonDto = {
          order_id: orderId,
          m_reason_id: reasonId,
          message: failureReason
        }

        await failureReasonRepository.create(dataCreateFailureReason);
      }
    } catch (error) {
      console.error("error: ", error);
    }
    
  }

  private static checkFailureReason(expeditionCode: string, log: any) {
    let failureReason: any = null;

    if (expeditionCode === EXPEDITION_CODE.NINJA && log.status === ORDER_STATUS_NINJA.DELIVERY_EXCEPTION) {
      failureReason = log.delivery_exception.failure_reason;
    } else if (expeditionCode === EXPEDITION_CODE.IDEXPRESS && log.problemDescription && log.operationType === ORDER_STATUS_IDEXPRESS.PROBLEM_ON_SHIPMENT_SCAN) {
      failureReason = log.problemDescription;
    } else if (expeditionCode === EXPEDITION_CODE.JNE && log.status) {
      const history = log.history.pop();

      if (JNE_FAILURE_POD_CODES.includes(history.status_code)) {
        failureReason = history.status_desc;
      }
    } else if (expeditionCode === EXPEDITION_CODE.SAP && log.rowstate_name === ORDER_STATUS_SAP.POD_UNDELIVERED) {
      failureReason = log.description;
    }

    return failureReason;
  }
}
