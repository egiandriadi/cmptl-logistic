import { IdexpressLocationRepository } from "../../repositories/idexpress-location.repository";
import RegionRepository from "../../repositories/region.repository";
import { RequestTariffDto } from "./dto/request-tariff.dto";
import md5 from "md5";
import config from "../../config/global.config";
import qs from "qs";
import { ResponseRecommendationDto } from "./dto/response-recommendation.dto";
import { ResponseTariffDto } from "./dto/response-tariff.dto";
import { PayloadCheckTariffDto } from "./dto/api-check-tariff.dto";
import { PayloadDto } from "./dto/api-payload.dto";
import axios from "axios";
import { RequestOrderDto } from "./dto/request-order.dto";
import { PayloadOrderDto } from "./dto/api-create-order.dto";
import { convertMiliToSecond, dateNowSecond } from "../../helpers/date.helper";
import AuditTrailRepository from "../../repositories/audit-trail.repository";
import EkspedisiRepository from "../../repositories/ekspedisi.repository";
import { CreateAuditTrailDto } from "../../repositories/dto/create-audit-trail.dto";
import { UpdateLogsAuditTrailDto } from "../../repositories/dto/update-logs-audit-trail.dto";
import {
  AUDIT_TRAIL_ACTION_CANCEL,
  AUDIT_TRAIL_ACTION_GENERATE,
  AUDIT_TRAIL_MODULE,
  EXPEDITION_IDEXPRESS_CODE,
  IDEXPRESS_API_DATA_DUPLICATE,
  IDEXPRESS_API_STATUS_OK,
  IDEXPRESS_API_TIMEOUT,
  IDEXPRESS_TYPE_CARGO,
  IDEXPRESS_TYPE_LITE,
  IDEXPRESS_TYPE_STANDARD,
  PAYLOAD_CATEGORY_ITEMS,
  PAYLOAD_DROP_OFF_CODE,
  PAYLOAD_PAYMENT_TYPE_PERIODIC,
  PAYLOAD_PICKUP_CODE,
  STATUS_CANCELED,
  URL_CANCEL_ORDER,
  URL_CREATE_ORDER,
  URL_GET_TARIFF,
  URL_TRACK_STATUS,
} from "./constans";
import OrderRepository from "../../repositories/order.repository";
import StatusOrderRepository from "../../repositories/status-order.repository";
import { PayloadCancelOrderDto } from "./dto/api-cancel-order.dto";
import { ResponseCancelOrderDto } from "./dto/response-cancel-order.dto";
import OrderResponse from "../../libs/order/order-response";
import newlineCleanerHelper from "../../helpers/newline-cleaner.helper";
import { PayloadTrackStatusDto } from "./dto/api-track-status.dto";
import { ResponseTrackStatusDto } from "./dto/response-track-status.dto";
import EkspedisiLogRepository from "../../repositories/ekspedisi-log.repository";
import { EXPEDITION_CODE } from "../../constants/expedition-code";
import _, { last } from "lodash";
import { concatMap, from, Observable } from "rxjs";
import { subscribe } from "diagnostics_channel";
import TrackHistoryDto from "./dto/track-history.dto";
import RawWebhookDto from "./dto/raw-webhook.dto";
import LastStatus from "./constants/last-status";
import Message from "./constants/standarized-message";
import * as util from 'util';
import { EXPEDITION_LOG_TYPE, WebhookServices } from "../webhook.service";
import WebhookRequestInterface from "../../libs/webhook/webhook-request.interface";
import moment from "moment";
import FlatRateService from "../flat-rate/flat-rate.service";
import { RequestFlatRateDto } from "../flat-rate/dto/request-flat-rate.dto";
import { HTTP_STATUS } from "../../constants/http-status";

export class IdexpressService {
  private regionRepository;
  private idexpressLocationRepository;
  private auditTrailRepository;
  private orderRepository;
  private ekspedisiLogRepository;
  private statusOrderRepository;

  constructor() {
    this.regionRepository = new RegionRepository();
    this.idexpressLocationRepository = new IdexpressLocationRepository();
    this.auditTrailRepository = new AuditTrailRepository();
    this.orderRepository = new OrderRepository();
    this.ekspedisiLogRepository = new EkspedisiLogRepository();
    this.statusOrderRepository = new StatusOrderRepository();
  }

  public async getTariff(requestTariff: RequestTariffDto): Promise<ResponseTariffDto> {
    const originRegion = await this.regionRepository.getById(requestTariff.origin);
    const destinationRegion = await this.regionRepository.getById(requestTariff.destination);

    if (!originRegion || !destinationRegion) throw new Error("Wilayah tidak valid");

    const { originIdexpressLocation, destinationIdexpressLocation } = await this.validateLocationCovered(
      originRegion.id,
      destinationRegion.id,
      requestTariff.isCod,
      requestTariff.serviceType
    );

    const payload: PayloadCheckTariffDto = {
      senderCityId: originIdexpressLocation.city_id,
      recipientDistrictId: destinationIdexpressLocation.district_id,
      weight: requestTariff.weight,
      expressType: requestTariff.serviceType,
    };

    const isProductionKey = true; // set true to get expedition api key production for check tariff
    const responseApiIdexpress = await this.requestApiIdexpress(URL_GET_TARIFF, payload, "POST", isProductionKey);

    const isApiHttpError = responseApiIdexpress.status !== HTTP_STATUS.OK;
    const isApiStatusError = responseApiIdexpress.data?.code !== IDEXPRESS_API_STATUS_OK;

    if (isApiHttpError || isApiStatusError) {
      console.error("failed check tariff", JSON.stringify(responseApiIdexpress.data));
      throw new Error(responseApiIdexpress.data.desc);
    }

    let originalPrice = responseApiIdexpress.data.data;
    let discountPrice = originalPrice;

    // Get flat rate originalPrice
    const flatRateService = new FlatRateService();
    const requestFlatRate: RequestFlatRateDto = {
      expeditionCode: EXPEDITION_CODE.IDEXPRESS,
      expeditionService: requestTariff.serviceType,
      originRegionCode: originRegion.kode_wilayah ?? "",
      destinationRegionCode: destinationRegion.kode_wilayah ?? "",
      originalPrice: originalPrice,
      weight: requestTariff.weight,
    }
    const flatRate = await flatRateService.getFlatRate(requestFlatRate);
    if (flatRate) discountPrice = flatRate.price;

    const response: ResponseTariffDto = {
      origin_city: originRegion.kabupaten_kota ?? "",
      destination_city: destinationRegion.kabupaten_kota ?? "",
      services: requestTariff.serviceType,
      amount: discountPrice,
      original_amount: originalPrice,
      ...(flatRate ? { flat_rate: flatRate.flatRate } : {}),
    }

    return response;
  }



  public async getTarifRecommendation(requestTariff: RequestTariffDto): Promise<ResponseRecommendationDto> {
    const originRegion = await this.regionRepository.getById(requestTariff.origin);
    const destinationRegion = await this.regionRepository.getById(requestTariff.destination);

    if (!originRegion || !destinationRegion) throw new Error("Wilayah tidak valid");

    const { originIdexpressLocation, destinationIdexpressLocation } = await this.validateLocationCovered(
      originRegion.id,
      destinationRegion.id,
      requestTariff.isCod,
      requestTariff.serviceType
    );

    const payload: PayloadCheckTariffDto = {
      senderCityId: originIdexpressLocation.city_id,
      recipientDistrictId: destinationIdexpressLocation.district_id,
      weight: requestTariff.weight,
      expressType: requestTariff.serviceType,
    };

    const isProductionKey = true; // set true to get expedition api key production for check tariff
    const responseApiIdexpress = await this.requestApiIdexpress(URL_GET_TARIFF, payload, "POST", isProductionKey);

    const isApiHttpError = responseApiIdexpress.status !== HTTP_STATUS.OK;
    const isApiStatusError = responseApiIdexpress.data?.code !== IDEXPRESS_API_STATUS_OK;

    if (isApiHttpError || isApiStatusError) {
      console.error("failed check tariff", JSON.stringify(responseApiIdexpress.data));
      throw new Error(responseApiIdexpress.data?.desc);
    }

    const ekspedisiRepository = new EkspedisiRepository();
    const layanan = await ekspedisiRepository.findLayanan("idexpress", requestTariff.serviceType);

    try {
      let response: ResponseRecommendationDto = {
        ekspedisi_name: layanan?.ekspedisi_name,
        ekspedisi_description: layanan?.ekspedisi_description,
        ekspedisi_code: layanan?.ekspedisi_code,
        ekspedisi_logo: layanan?.ekspedisi_logo,
        ekspedisi_id: layanan?.ekspedisi_id,
        layanan_ekspedisi_id: layanan?.layanan_ekspedisi_id,
        origin_city: originRegion.kabupaten_kota ?? "",
        destination_city: destinationRegion.kabupaten_kota ?? "",
        services: requestTariff.serviceType,
        amount: responseApiIdexpress.data.data,
      }

      return response;
    } catch (error) {
      const response: ResponseRecommendationDto = {
        ekspedisi_name: layanan?.ekspedisi_name,
        ekspedisi_description: layanan?.ekspedisi_description,
        ekspedisi_code: layanan?.ekspedisi_code,
        ekspedisi_logo: layanan?.ekspedisi_logo,
        ekspedisi_id: layanan?.ekspedisi_id,
        layanan_ekspedisi_id: layanan?.layanan_ekspedisi_id,
        origin_city: originRegion.kabupaten_kota ?? "",
        destination_city: destinationRegion.kabupaten_kota ?? "",
        services: requestTariff.serviceType,
        amount: 0,
      }

      return response;
    }
  }

  public async createOrder(requestOrder: RequestOrderDto) {
    const payload: PayloadOrderDto = await this.mapRequestOrder(requestOrder);

    const dataCreateAuditTrail: CreateAuditTrailDto = {
      action: AUDIT_TRAIL_ACTION_GENERATE,
      module: AUDIT_TRAIL_MODULE,
      key_id: requestOrder.order_id,
      logs: null,
      payload: JSON.stringify(payload),
      status_code: 0,
    }
    const auditTrailCreated = await this.auditTrailRepository.create(dataCreateAuditTrail);

    let responseApiIdexpress;

    try {
      responseApiIdexpress = await this.requestApiIdexpress(URL_CREATE_ORDER, payload, "POST");
    } catch (error: any) {
      const dataUpdateAuditTrail: UpdateLogsAuditTrailDto = {
        logs: JSON.stringify(error?.message),
        status_code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      }
      this.auditTrailRepository.updateLogsById(auditTrailCreated.id, dataUpdateAuditTrail);

      throw error;
    }
    
    const isApiHttpError = responseApiIdexpress.status !== HTTP_STATUS.OK;
    const isApiStatusError = responseApiIdexpress.data?.code !== IDEXPRESS_API_STATUS_OK;
    const isDuplicateOrder = responseApiIdexpress.data?.code === IDEXPRESS_API_STATUS_OK && responseApiIdexpress.data?.data?.[0]?.code === IDEXPRESS_API_DATA_DUPLICATE;

    if (isApiHttpError || isApiStatusError || isDuplicateOrder) {
      console.error("failed create order", JSON.stringify(responseApiIdexpress.data));

      const dataUpdateAuditTrail: UpdateLogsAuditTrailDto = {
        logs: JSON.stringify(responseApiIdexpress.data),
        status_code: responseApiIdexpress.status === HTTP_STATUS.OK ? HTTP_STATUS.BAD_REQUEST : responseApiIdexpress.status,
      }
      this.auditTrailRepository.updateLogsById(auditTrailCreated.id, dataUpdateAuditTrail);

      throw new Error(isDuplicateOrder ? responseApiIdexpress.data.data[0].msg : responseApiIdexpress.data?.desc);
    }

    const dataUpdateAuditTrail: UpdateLogsAuditTrailDto = {
      logs: JSON.stringify(responseApiIdexpress.data),
      status_code: 200,
    }
    this.auditTrailRepository.updateLogsById(auditTrailCreated.id, dataUpdateAuditTrail);

    const response: OrderResponse = {
      tracking_number: responseApiIdexpress.data.data[0].waybillNo,
      order_id: requestOrder.order_id,
      tlc_code: responseApiIdexpress.data.data[0].sortingCode,
    }

    return response;
  }

  public async cancelOrder(uuids: string[]) {
    let countSuccess = 0;
    let countFailed = 0;

    const orders = await this.orderRepository.getForCancelOrders(uuids, EXPEDITION_IDEXPRESS_CODE);
    if (!orders.length) throw new Error("Data orders not found");

    await Promise.all(
      orders.map(async (order: any) => {
        const awb = order.nomor_resi;
        if (!awb) return;

        try {
          const payload: PayloadCancelOrderDto = {
            waybillNo: awb,
          };
          const responseApiIdexpress = await this.requestApiIdexpress(URL_CANCEL_ORDER, payload, "POST");

          const isApiHttpError = responseApiIdexpress.status !== HTTP_STATUS.OK;
          const isApiStatusError = responseApiIdexpress.data?.code !== IDEXPRESS_API_STATUS_OK;

          if (isApiHttpError || isApiStatusError) {
            console.error("failed cancel order", JSON.stringify(responseApiIdexpress.data));
            throw new Error(responseApiIdexpress.data?.desc);
          }

          await this.orderRepository.updateStatus(order.id, STATUS_CANCELED);

          const dataCreateAuditTrail: CreateAuditTrailDto = {
            action: AUDIT_TRAIL_ACTION_CANCEL,
            module: AUDIT_TRAIL_MODULE,
            key_id: order.id.toString(),
            logs: JSON.stringify(responseApiIdexpress.data),
            payload: awb,
            status_code: 200,
          }
          await this.auditTrailRepository.create(dataCreateAuditTrail);

          countSuccess++;

        } catch (error: any) {
          const dataCreateAuditTrail: CreateAuditTrailDto = {
            action: AUDIT_TRAIL_ACTION_CANCEL,
            module: AUDIT_TRAIL_MODULE,
            key_id: order.id.toString(),
            logs: JSON.stringify(error?.message ?? error),
            payload: awb,
            status_code: error?.response?.status || 400,
          }
          await this.auditTrailRepository.create(dataCreateAuditTrail);

          countFailed++;
        }

      })
    );

    const response: ResponseCancelOrderDto = {
      success: countSuccess,
      failed: countFailed,
    }

    return response;
  }

  public async getTrackingStatus(awb: string): Promise<ResponseTrackStatusDto> {
    const payload: PayloadTrackStatusDto[] = [{
      waybillNo: awb,
    }];

    const webhookService = new WebhookServices;
    const isProductionKey = true; // set true to get expedition api key production for check tariff
    const responseApiIdexpress = await this.requestApiIdexpress(URL_TRACK_STATUS, payload, "GET", isProductionKey);

    const isApiHttpError = responseApiIdexpress.status !== HTTP_STATUS.OK;
    const isApiStatusError = responseApiIdexpress.data?.code !== IDEXPRESS_API_STATUS_OK;

    if (isApiHttpError || isApiStatusError) {
      console.error("failed get tracking status", JSON.stringify(responseApiIdexpress.data));
      throw new Error(responseApiIdexpress.data?.error || responseApiIdexpress.data?.message);
    }

    const { data } = responseApiIdexpress.data;

    const logs = await this.ekspedisiLogRepository.getByAwb(EXPEDITION_CODE.IDEXPRESS, awb);
    // check for history data
    if (data.historys) {
      const basicInfo = data.basicInfo;
      const histories = data.historys;

      const webhookDatas = _.map(histories, (history) => {
        const trackHistoryDto = TrackHistoryDto.hydrate(history)
        const lastStatusObj = _.find(LastStatus, (status) => {
          return status.operationType.toLowerCase() === trackHistoryDto.operationType.toLowerCase();
        })
        const lastStatus = lastStatusObj?.status || ''
        // map to webhook push data
        let rawWebhookDto = new RawWebhookDto;
        rawWebhookDto.clientCode = config.idexpress.production.app_id;
        rawWebhookDto.orderNo = basicInfo.orderNo;
        rawWebhookDto.waybillNo = trackHistoryDto.waybillNo;
        rawWebhookDto.operationType = trackHistoryDto.operationType;
        rawWebhookDto.lastOperationTime = trackHistoryDto.operationTime;
        rawWebhookDto.courierName = trackHistoryDto.courierName;
        rawWebhookDto.courierPhoneNumber = "";
        rawWebhookDto.currentBranch = trackHistoryDto.currentBranch;
        rawWebhookDto.nextBranch = trackHistoryDto.nextBranchName;
        rawWebhookDto.signer = trackHistoryDto.signer;
        rawWebhookDto.relation = trackHistoryDto.relation;
        rawWebhookDto.problemDescription = trackHistoryDto.problemCode.length > 0 ? trackHistoryDto.description : "";
        rawWebhookDto.proofOfStatus = trackHistoryDto.proofOfStatus;
        rawWebhookDto.message = this.parseOperationMessage(trackHistoryDto, lastStatus);
        return rawWebhookDto;
      });
      // filter our data, check by lastOperation time and message
      const filteredData = _.filter(webhookDatas, (history, index) => {
        const found = _.find(logs, (log, logIndex) => {
          const rawPayload  = log.raw;
          if (!rawPayload) return false;
          const payload     = JSON.parse(rawPayload);
          return payload.lastOperationTime === history.lastOperationTime || payload.message.trim() == history.message.trim();
        })
        if (found) {
          return false;
        } else if (history.message.length === 0) {
          return false;
        } else {
          return true;
        }
      })

      let trackObservables: any[];
      let insertLogFlag = true;

      if (filteredData.length === 0) {
        //return data
        const latestItem = _.first(_.orderBy(webhookDatas, [(webhook) => webhook.lastOperationTime ], [ 'desc' ]));
        if (!latestItem) throw new Error("Latest item not found.");
        trackObservables = [latestItem];
        insertLogFlag = false;
      } else {
        trackObservables = _.orderBy(filteredData, ['lastOperationTime'], ['asc']);
      }

      // using rxjs ensure that data is run one by one
      from(trackObservables).pipe(concatMap((data, index) => {
        return new Observable( subscribe => {
          const isLastItem : boolean = (trackObservables.length - 1) === index;
          const createdAtDt = data.lastOperationTime;
          let updateStatus : boolean = false;
          const webhookData : WebhookRequestInterface = {
            awb: data.waybillNo,
            expedition_code: EXPEDITION_CODE.IDEXPRESS,
            status: data.operationType,
            timestamp: moment.unix(data.lastOperationTime).format("YYYY-MM-DD HH:mm:ss"),
            payload: data
          }
          if (isLastItem) {
            updateStatus = true;
          }
          webhookService.updateStatus(webhookData, updateStatus, EXPEDITION_LOG_TYPE.TRACK, createdAtDt, insertLogFlag)
            .then((res) => {
              subscribe.next(res);
              subscribe.complete();
            })
            .catch((err) => {
              subscribe.next(err);
              subscribe.complete();
            })
        })
      })).subscribe({
        next: (data) => console.log(data),
        error: (err) => console.log(err.message),
        complete: () => console.log("Parsing complete.")
      })
      return data;
    } else throw new Error("Data gagal diambil.");
  }

  private async mapRequestOrder(requestOrder: RequestOrderDto): Promise<PayloadOrderDto> {
    const senderRegionId = requestOrder.isPickup ? requestOrder.pickup.wilayah_id : requestOrder.from.wilayah_id;

    const {
      originIdexpressLocation: senderLocation,
      destinationIdexpressLocation: recipientLocation,
    } = await this.validateLocationCovered(
      senderRegionId,
      requestOrder.to.wilayah_id,
      requestOrder.isCod,
      requestOrder.service_type
    );

    let pickupStartTime = convertMiliToSecond(Date.parse(requestOrder.pickup?.date + " 09:00:00"));
    let pickupEndTime = convertMiliToSecond(Date.parse(requestOrder.pickup?.date + " 22:00:00"));

    if (pickupStartTime <= (dateNowSecond() + 5400)) {
      pickupStartTime = dateNowSecond() + 54010;
    }

    if (pickupEndTime <= (pickupStartTime + 14400)) {
      pickupEndTime = pickupStartTime + 14410;
    }

    let result: PayloadOrderDto = {
      orderNo: requestOrder.order_id,
      orderTime: dateNowSecond(),
      expressType: requestOrder.service_type,
      itemName: newlineCleanerHelper(requestOrder.items[0].item_description),
      itemQuantity: requestOrder.items[0].quantity,
      itemCategory: PAYLOAD_CATEGORY_ITEMS,
      weight: requestOrder.weight.toString(),
      serviceType: requestOrder.isPickup ? PAYLOAD_PICKUP_CODE : PAYLOAD_DROP_OFF_CODE,
      senderName: requestOrder.isPickup ? requestOrder.pickup.name : newlineCleanerHelper(requestOrder.from.name),
      senderCellphone: requestOrder.isPickup ? requestOrder.pickup.phone : requestOrder.from.phone,
      senderProvinceId: senderLocation?.province_id ?? 0,
      senderCityId: senderLocation?.city_id ?? 0,
      senderDistrictId: senderLocation?.district_id ?? 0,
      senderAddress: requestOrder.isPickup ? newlineCleanerHelper(requestOrder.pickup.address) : newlineCleanerHelper(requestOrder.from.address),
      senderZipCode: requestOrder.isPickup ? requestOrder.pickup.zipcode : requestOrder.from.zipcode,
      recipientName: newlineCleanerHelper(requestOrder.to.name),
      recipientCellphone: requestOrder.to.phone,
      recipientProvinceId: recipientLocation?.province_id ?? 0,
      recipientCityId: recipientLocation?.city_id ?? 0,
      recipientDistrictId: recipientLocation?.district_id ?? 0,
      recipientAddress: newlineCleanerHelper(requestOrder.to.address),
      paymentType: PAYLOAD_PAYMENT_TYPE_PERIODIC,
      pickupStartTime: pickupStartTime,
      pickupEndTime: pickupEndTime,
    }

    if (requestOrder.isCod) {
      result.codAmount = requestOrder.cod_price.toString();
    }

    if (requestOrder.insured_value) {
      result.insured = "1";
      result.itemValue = requestOrder.insured_value.toString();
    }

    return result;
  }

  private async validateLocationCovered(originRegionId: number, destinationRegionId: number, isCod: boolean, serviceType: string) {
    const originIdexpressLocation = await this.idexpressLocationRepository.getByRegionId(originRegionId);
    if (!originIdexpressLocation) throw new Error("Wilayah tidak tercover oleh ekspedisi");

    let destinationIdexpressLocation;

    if (isCod) {
      if (serviceType === IDEXPRESS_TYPE_STANDARD) {
        destinationIdexpressLocation = await this.idexpressLocationRepository.getByRegionIdAndCodStandard(destinationRegionId, isCod);
      } else if (serviceType === IDEXPRESS_TYPE_LITE) {
        destinationIdexpressLocation = await this.idexpressLocationRepository.getByRegionIdAndCodLite(destinationRegionId, isCod);
      } else if (serviceType === IDEXPRESS_TYPE_CARGO) {
        destinationIdexpressLocation = await this.idexpressLocationRepository.getByRegionIdAndCodCargo(destinationRegionId, isCod);
      }

      if (!destinationIdexpressLocation) throw new Error("Wilayah tidak tercover oleh COD");
    } else {
      destinationIdexpressLocation = await this.idexpressLocationRepository.getByRegionId(destinationRegionId);
      if (!destinationIdexpressLocation) throw new Error("Wilayah tidak tercover oleh ekspedisi");
    }

    return { originIdexpressLocation, destinationIdexpressLocation };
  }

  private async requestApiIdexpress(url: string, dataPayload: any, method: string, prodKey = false) {

    const dataPayloadString = JSON.stringify(dataPayload);
    const sign = this.calculateSign(dataPayloadString, prodKey);

    const payload: PayloadDto = {
      appId: (prodKey === true ? config.idexpress.production.app_id : config.idexpress.app_id),
      sign: sign,
      data: dataPayloadString,
    };

    const options = {
      method: method,
      url,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      validateStatus: (status: number) => status >= HTTP_STATUS.OK && status <= HTTP_STATUS.INTERNAL_SERVER_ERROR,
      timeout: IDEXPRESS_API_TIMEOUT, // in milliseconds
      data: qs.stringify(payload),
    };

    return await axios.request(options);
  }
  
  private calculateSign(dataPayloadString : string, prodKey : boolean) {
    if (prodKey === true)    
      return md5(dataPayloadString + config.idexpress.production.app_id + config.idexpress.production.secret_key);
    else
      return md5(dataPayloadString + config.idexpress.app_id + config.idexpress.secret_key);
  }
  /** need refactor to its own function */
  protected parseOperationMessage(trackHistoryDto : TrackHistoryDto, lastStatus : string) {
    const messageObj = _.find(Message, (message) => {
      return message.status.toLowerCase() === lastStatus.toLowerCase()
    });
    if (!messageObj) return '';
    const { message } = messageObj;
    switch(lastStatus.toLowerCase()) {
      case "pickup":
        if (trackHistoryDto.courierName.length === 0) return '';
        return util.format(message, trackHistoryDto.courierName);
      case "sending":
        return util.format(message, trackHistoryDto.nextBranchName);
      case "arrival":
        return util.format(message, trackHistoryDto.currentBranch);
      case "delivery":
        return util.format(message, trackHistoryDto.courierName);
      case "pod":
        if (trackHistoryDto.relation.length === 0) {
          const replaceMessage = message.replace('%s, ', '');
          return util.format(replaceMessage, trackHistoryDto.signer);
        } else {
          return util.format(message, trackHistoryDto.relation, trackHistoryDto.signer);
        }
      case "return pod":
        return util.format(message, trackHistoryDto.signer);
      case "problem on shipment":
        const problem = trackHistoryDto.description.replace(/[\w\s]+(due to\s)/i, '');
        return util.format(message, problem);
      case "confirm return bill":
        return message;
      case "pickup failure":
        return util.format(message, trackHistoryDto.problemCode);
      default:
        return "";
    }
  }
}
