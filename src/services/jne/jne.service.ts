import _, { filter } from 'lodash';
import { concatMap, from, mergeMap, Observable } from 'rxjs';

import config from "../../config/global.config";
import { changeDatetimeFormat } from "../../helpers/date.helper";
import AuditTrailRepositoryInterface from "../../repositories/audit-trail.repository.interface";
import AuditTrailRepository from "../../repositories/audit-trail.repository";
import JneLocationRepositoryInterface from "../../repositories/jne-location.repository.interface";
import JneLocationRepository from "../../repositories/jne-location.repository";
import RegionRepositoryInterface from "../../repositories/region.repository.interface";
import RegionRepository from "../../repositories/region.repository";
import CheckTariffRequestDto from "./api/dto/check-tariff-request.dto";
import RequestTariffDto from "./dto/request-tariff.dto";
import ResponseTariffDto from "./dto/response-tariff.dto";
import RequestOrderDto from "./dto/request-generate.dto";
import ResponseOrderDto from "./dto/response-generate.dto";
import OrderRepository from "../../repositories/order.repository";
import { CreateAuditTrailDto } from "../../repositories/dto/create-audit-trail.dto";
import { UpdateLogsAuditTrailDto } from "../../repositories/dto/update-logs-audit-trail.dto";
import JneApiService from "./api/jne-api-service";
import CreatedOrderRequestDto from "./api/dto/create-order-request.dto";
import { AUDIT_TRAIL_ACTION_CANCEL, AUDIT_TRAIL_ACTION_GENERATE, AUDIT_TRAIL_MODULE, DEFAULT_COUNTRY, DEFAULT_DELIVERY_NOTES, DEFAULT_PICKUP_SERVICE, DEFAULT_PICKUP_VEHICLE, EKSPEDISI_CODE, SERVICE_CTC, SERVICE_REG, STATUS_CANCELLED } from "./constans";
import EkspedisiRepository from "../../repositories/ekspedisi.repository";
import CancelOrderRequestDto from "./api/dto/cancel-order-request.dto";
import UserRepository from "../../repositories/user.repository";
import ResponseCancelOrderDto from "./api/dto/response-cancel-order.dto";
import { ResponseRecommendationDto } from "./dto/response-recommendation.dto";
import OrderResponse from "../../libs/order/order-response";
import FlatRateService from "../flat-rate/flat-rate.service";
import { RequestFlatRateDto } from "../flat-rate/dto/request-flat-rate.dto";
import TrackRequestDto from "./api/dto/track-request.dto";
import EkspedisiLogRepositoryInterface from "../../repositories/ekspedisi-log.repository.interface";
import { EXPEDITION_CODE } from "../../constants/expedition-code";
import TrackHistoryDto from "./api/dto/track-history.dto";
import { subscribe } from "diagnostics_channel";
import { EXPEDITION_LOG_TYPE, WebhookServices } from "../webhook.service";
import WebhookRequestInterface from "../../libs/webhook/webhook-request.interface";
import StatusOrderRepository from "../../repositories/status-order.repository";
import StatusOrderRepositoryInterface from "../../repositories/status-order.repository.interface";
import EkspedisiLogRepository from "../../repositories/ekspedisi-log.repository";
import GroupStatusOrderRepositoryInterface from "../../repositories/group-status-order.repository.interface";
import GroupStatusOrderRepository from "../../repositories/group-status-order.repository";
import moment from 'moment';

const STATUSES = {
  SHIPPED : "SHIPPED",
  SUCCESS_PICKUP : "SUCCESS PICKUP"
}
export class JneService {

  private regionRepository : RegionRepositoryInterface;
  private jneLocationRepository : JneLocationRepositoryInterface;
  private jneApiService: JneApiService;
  private auditTrailRepository : AuditTrailRepositoryInterface;
  private orderRepository : OrderRepository;
  private userRepository : UserRepository;
  private ekspedisiRepository: EkspedisiRepository;
  private ekspedisiLogRepository: EkspedisiLogRepositoryInterface;
  private statusOrderRepository: StatusOrderRepositoryInterface;
  private groupStatusOrderRepository : GroupStatusOrderRepositoryInterface;

  constructor() {
    this.regionRepository = new RegionRepository();
    this.jneLocationRepository = new JneLocationRepository();
    this.jneApiService = new JneApiService();
    this.auditTrailRepository = new AuditTrailRepository();
    this.orderRepository = new OrderRepository();
    this.userRepository = new UserRepository();
    this.ekspedisiRepository = new EkspedisiRepository();
    this.ekspedisiLogRepository = new EkspedisiLogRepository();
    this.statusOrderRepository = new StatusOrderRepository();
    this.groupStatusOrderRepository = new GroupStatusOrderRepository();
  }

  public async checkTariff(requestTariff: RequestTariffDto): Promise<ResponseTariffDto> {
    const originData = await this.regionRepository.getById(requestTariff.origin);
    const destinationData = await this.regionRepository.getById(requestTariff.destination);

    if (!originData || !destinationData) throw new Error("Wilayah tidak valid");

    const originLocation = await this.jneLocationRepository.getByZipCode(originData.kode_pos);
    const recipientLocation = await this.jneLocationRepository.getByZipCode(destinationData.kode_pos);

    if (!originLocation || !recipientLocation) throw new Error("Wilayah tidak tercover oleh ekspedisi");

    const originCode = this.mapOriginCode(originLocation);

    const payload = new CheckTariffRequestDto(
      originCode,
      recipientLocation.tariff_code,
      requestTariff.weight
    );

    const result = await this.jneApiService.checkTariff(payload);

    const selectedService = _.find(result.getServices(), (serviceCost) => {
      return this.checkServiceCode(serviceCost.service_display, 
                                  serviceCost.service_code, 
                                  requestTariff.serviceType);
    });
    if (!selectedService) throw new Error("Service tidak ditemukan");

    let originalPrice = parseInt(selectedService.price);
    let discountPrice = originalPrice;

    // Get flat rate originalPrice
    const flatRateService = new FlatRateService();
    const requestFlatRate: RequestFlatRateDto = {
      expeditionCode: EXPEDITION_CODE.JNE,
      expeditionService: requestTariff.serviceType,
      originRegionCode: originData.kode_wilayah,
      destinationRegionCode: destinationData.kode_wilayah,
      originalPrice: originalPrice,
      weight: requestTariff.weight,
    }
    const flatRate = await flatRateService.getFlatRate(requestFlatRate);
    if (flatRate) discountPrice = flatRate.price;

    const response: ResponseTariffDto = {
      origin_city: originData.kabupaten_kota ?? "",
      destination_city: destinationData.kabupaten_kota ?? "",
      services: requestTariff.serviceType,
      amount: discountPrice ?? originalPrice,
      original_amount: originalPrice,
      ...(flatRate ? { flat_rate: flatRate.flatRate } : {}),
    }
    return response;
  }

  private splitString(str: string, maxLength: number) {
    if (str.length < maxLength) {
      return {
        RECEIVER_ADDR1: str,
        RECEIVER_ADDR2: "",
        RECEIVER_ADDR3: "",
      }
    }

    let parts: string[] = [];
    let index = 0;

    while (index < str.length) {
        parts.push(str.substring(index, index + maxLength));
        index += maxLength;
    }

    return {
        RECEIVER_ADDR1: parts[0] || "", // In case parts array doesn't have these indices
        RECEIVER_ADDR2: parts[1] || "",
        RECEIVER_ADDR3: parts[2] || ""
    };
}

  public async createOrder(requestOrder: RequestOrderDto): Promise<ResponseOrderDto> {
    const senderZipCode = requestOrder.isPickup ? requestOrder.pickup.zipcode : requestOrder.from.zipcode;
    const originLocation = await this.jneLocationRepository.getByZipCode(senderZipCode);
    const recipientLocation = await this.jneLocationRepository.getByZipCode(requestOrder.to.zipcode);
    
    if (!originLocation || !recipientLocation) throw new Error("Wilayah tidak valid");

    const originCode = this.mapOriginCode(originLocation);

    let goodsAmount = requestOrder.insured_value ?? 0;
    let spcInstruct = requestOrder.delivery_notes ?? DEFAULT_DELIVERY_NOTES;

    let receiverAddr: string = requestOrder.to.address;
    let maxLength: number = 85; 
    let resultAddress = this.splitString(receiverAddr, maxLength);

    const payload = new CreatedOrderRequestDto(
      originLocation.tariff_code.substring(0, 3) + "000",
      requestOrder.order_id,
      originCode,
      recipientLocation.tariff_code,
      requestOrder.service_type,
      requestOrder.weight,
      requestOrder.items[0].quantity,
      requestOrder.items[0].item_description,
      goodsAmount,
      goodsAmount > 0 ? "Y" : "N",
      spcInstruct,
      requestOrder.seller_id,
      requestOrder.isPickup ? "PICKUP" : "DROP",
      undefined,
      requestOrder.seller_company_name,
      changeDatetimeFormat(requestOrder.isPickup ? requestOrder.pickup.date : requestOrder.delivery_start_date, 'YYYY-MM-DD', 'DD-MM-YYYY'),
      changeDatetimeFormat(requestOrder.isPickup ? requestOrder.pickup.date : requestOrder.delivery_start_date, 'HH:mm', 'HH:mm'),
      requestOrder.isPickup ? requestOrder.pickup.name : requestOrder.from.name,
      requestOrder.isPickup ? requestOrder.pickup.phone : requestOrder.from.phone,
      requestOrder.isPickup ? requestOrder.pickup.address : requestOrder.from.address,
      requestOrder.isPickup ? requestOrder.pickup.kecamatan : requestOrder.from.kecamatan,
      requestOrder.isPickup ? requestOrder.pickup.city : requestOrder.from.city,
      DEFAULT_PICKUP_SERVICE, 
      DEFAULT_PICKUP_VEHICLE, 
      requestOrder.from.name,
      requestOrder.from.address,
      requestOrder.from.kecamatan,
      requestOrder.from.city,
      requestOrder.from.zipcode,
      requestOrder.from.province,
      requestOrder.from.name,
      requestOrder.from.phone,
      undefined,
      DEFAULT_COUNTRY,
      requestOrder.to.name,
      resultAddress.RECEIVER_ADDR1,//requestOrder.to.address,
      resultAddress.RECEIVER_ADDR2,
      requestOrder.to.city,
      requestOrder.to.zipcode,
      requestOrder.to.province,
      requestOrder.to.name,
      requestOrder.to.phone,
      `${resultAddress.RECEIVER_ADDR3} ${requestOrder.to.kecamatan}`,
      DEFAULT_COUNTRY,
      undefined,
      undefined,
      requestOrder.isCod ? "YES" : "NO",
      requestOrder.cod_price,
      undefined,
      undefined,
      undefined,
      undefined,
      requestOrder.pickup.name,
      requestOrder.pickup.address,
      undefined,
      undefined,
      requestOrder.pickup.city,
      requestOrder.pickup.zipcode,
      requestOrder.pickup.province,
      undefined,
      requestOrder.pickup.name,
      requestOrder.pickup.phone,
      undefined
    );

    const dataCreateAuditTrail: CreateAuditTrailDto = {
      action: AUDIT_TRAIL_ACTION_GENERATE,
      module: AUDIT_TRAIL_MODULE,
      key_id: requestOrder.order_id,
      logs: null,
      payload: JSON.stringify(payload),
      status_code: 0,
    }
    const auditTrailCreated = await this.auditTrailRepository.create(dataCreateAuditTrail);

    let result: any;

    try {
      result = await this.jneApiService.createOrder(payload);
    } catch (error: any) {
      this.auditTrailRepository.updateLogsById(auditTrailCreated.id, {
        logs: JSON.stringify(error.message),
        status_code: 400,
      });
      
      throw error;
    }

    if (result.detail.length === 0) {
      this.auditTrailRepository.updateLogsById(auditTrailCreated.id, {
        logs: "null",
        status_code: 400,
      });
      throw new Error("Wilayah tidak tercover oleh ekspedisi");
    } else if (result.detail[0].status !== "success") {
      this.auditTrailRepository.updateLogsById(auditTrailCreated.id, {
        logs: JSON.stringify(result),
        status_code: 400,
      });
      throw new Error(result.detail[0].reason);
    }

    this.auditTrailRepository.updateLogsById(auditTrailCreated.id, {
      logs: JSON.stringify(result),
      status_code: 200,
    });

    const tlcCode = originLocation.tariff_code.substring(0, 3) + " - " + recipientLocation.tariff_code.substring(0, 3);
    
    const response: OrderResponse = {
      tracking_number: result.detail[0].cnote_no,
      order_id: requestOrder.order_id,
      tlc_code: tlcCode || "",
    }
    return response;
  }
  
  public async cancelOrder(orderUUIDs: string[]) {
    const ekspedisiModel  = await this.ekspedisiRepository.findByCode(EKSPEDISI_CODE);
    if (!ekspedisiModel) throw new Error("Ekspedisi not found")

    const orders = await this.orderRepository.getByUUIDs(orderUUIDs, ekspedisiModel.id);
    if (orders.length < 1) throw new Error("Data orders not found");

    let successCount = 0;
    let errorCount = 0;

    await Promise.all(orders.map(async (order: any) => {
      const awb = order.nomor_resi;
      if (!awb) return;

      const user = await this.userRepository.getById(order.user_id);
      if (!user) return;

      try {
        const orderData = new CancelOrderRequestDto(awb, user.name);
        const result = await this.jneApiService.cancelOrder(orderData);
        if (!result.status) {
          const dataCreateAuditTrail: CreateAuditTrailDto = {
            action: AUDIT_TRAIL_ACTION_CANCEL,
            module: AUDIT_TRAIL_MODULE,
            key_id: order.id.toString(),
            logs: JSON.stringify(result),
            payload: awb,
            status_code: 400,
          }
          await this.auditTrailRepository.create(dataCreateAuditTrail);
          errorCount++;
        } else {
          const dataCreateAuditTrail: CreateAuditTrailDto = {
            action: AUDIT_TRAIL_ACTION_CANCEL,
            module: AUDIT_TRAIL_MODULE,
            key_id: order.id.toString(),
            logs: JSON.stringify(result),
            payload: awb,
            status_code: 200,
          }
          await this.auditTrailRepository.create(dataCreateAuditTrail);
          successCount++;

          await this.orderRepository.updateStatus(order.id, STATUS_CANCELLED);
        }
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
        errorCount++;
      }

      })
    );

    const response: ResponseCancelOrderDto = {
      success: successCount,
      failed: errorCount,
    }

    return response;
  }

  public async getTarifRecommendation(requestTariff : RequestTariffDto) : Promise<ResponseRecommendationDto> {
    const originData = await this.regionRepository.getById(requestTariff.origin);
    const destinationData = await this.regionRepository.getById(requestTariff.destination);

    if (!originData || !destinationData) throw new Error("Wilayah tidak valid");

    const originLocation = await this.jneLocationRepository.getByZipCode(originData.kode_pos);
    const recipientLocation = await this.jneLocationRepository.getByZipCode(destinationData.kode_pos);

    if (!originLocation || !recipientLocation) throw new Error("Wilayah tidak tercover oleh ekspedisi");

    const originCode = this.mapOriginCode(originLocation);

    const payload = new CheckTariffRequestDto(
      originCode,
      recipientLocation.tariff_code,
      requestTariff.weight
    );

    const result = await this.jneApiService.checkTariff(payload);

    const selectedService = _.find(result.getServices(), (serviceCost) => {
      return this.checkServiceCode(serviceCost.service_display, 
                                  serviceCost.service_code, 
                                  requestTariff.serviceType);
    });
    if (!selectedService) throw new Error("Service tidak ditemukan");

    const ekspedisiRepository =  new EkspedisiRepository();
    const layanan = await ekspedisiRepository.findLayanan(EKSPEDISI_CODE, requestTariff.serviceType);

    try {
      let response: ResponseRecommendationDto = {
          ekspedisi_name: layanan?.ekspedisi_name,
          ekspedisi_description: layanan?.ekspedisi_description,
          ekspedisi_code: layanan?.ekspedisi_code,
          ekspedisi_logo: layanan?.ekspedisi_logo,
          ekspedisi_id: layanan?.ekspedisi_id,
          layanan_ekspedisi_id: layanan?.layanan_ekspedisi_id,
          origin_city: originData.kabupaten_kota ?? "",
          destination_city: destinationData.kabupaten_kota ?? "",
          services: requestTariff.serviceType,
          amount: parseInt(selectedService.price)
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
          origin_city: originData.kabupaten_kota ?? "",
          destination_city: destinationData.kabupaten_kota ?? "",
          services: requestTariff.serviceType,
          amount: 0,
        }
        return response;
        
      }  
  }

  public async getTrackingStatus(awb : string) {
    try {
      
      const webhookService = new WebhookServices;
      const trackRequestDto = TrackRequestDto.hydrate(awb);
      const ekspedisiModel  = await this.ekspedisiRepository.findByCode(EXPEDITION_CODE.JNE);
      if (!ekspedisiModel) throw new Error("Ekspedisi ID tidak ditemukan.");
      const res = await this.jneApiService.track(trackRequestDto);
      const webhookLogs = await this.ekspedisiLogRepository.getByAwb(EXPEDITION_CODE.JNE, awb);

      console.log("🚀 ~ JneService ~ trackStatus:" + JSON.stringify(res))

      let pickupFlag = false;

      from(res.history).pipe(concatMap((data : any, index) => {

        return new Observable( subscribe => {

          const createdDate = moment(data.date, "DD-MM-YYYY HH:mm").format("YYYY-MM-DD HH:mm");

          this.filterHistoryWebhook(webhookLogs, createdDate).then((filterResult) => {
            
            let insertLogFlag = true;

            if (filterResult === true) {
              insertLogFlag = false;
            }

            this.statusOrderRepository.getByEkspedisiCodeAndId(data.code, ekspedisiModel.id)
            .then(this.getMasterStatus.bind(this))
            .then((masterStatus) => {

              let updateStatus : boolean = false; // flag for update status
              const isLastItem : boolean = (res.history.length - 1) === index;

              const { m_status_order } = masterStatus;

              if (masterStatus.m_status_order.name === STATUSES.SUCCESS_PICKUP) {
                  pickupFlag = true;
              }

              const status = (pickupFlag === true && m_status_order.name === STATUSES.SUCCESS_PICKUP ? STATUSES.SHIPPED : masterStatus.m_status_order.name);

              const trackHistoryDto = TrackHistoryDto.hydrate(res, status, index);

              const webhookData : WebhookRequestInterface = {
                awb: trackHistoryDto.awb,
                expedition_code: EXPEDITION_CODE.JNE,
                status: status,
                timestamp: createdDate,
                payload: trackHistoryDto
              }    
              
              const dbCreatedAtUnixtime = moment(data.date, "DD-MM-YYYY HH:mm").subtract(7, 'hours').unix();

              if (isLastItem) {
                // force status for last item
                updateStatus = true;
              }
                    
              webhookService.updateStatus(webhookData, updateStatus, EXPEDITION_LOG_TYPE.TRACK, dbCreatedAtUnixtime, insertLogFlag)
                .then((res) => {
                  subscribe.next(res);
                  subscribe.complete();
                })
                .catch((err) => {
                  subscribe.next(err);
                  subscribe.complete();
                })
            }).catch((err) => {
              console.error(err);
              subscribe.error("Gagal mencari status order utama");
            })
          })
        })
      })).subscribe({
        next : (data) => {
          console.log(JSON.stringify(data))
        },
        error : (data) => {
          console.error(data.message)
        },
        complete : () => {
          console.log("Parsing completed.")
        }
      })

      return res;
    } catch (err) {
      throw err;
    }
  }

  protected filterHistoryWebhook(webhookLogs : any, createdDate : string) {
    return new Promise((resolve, reject) => {
      if (webhookLogs.length > 0) {
        const found = _.find(webhookLogs, (log, index) => {
          const rawPayload  = log.raw;
          if (!rawPayload) return false;
          const payload     = JSON.parse(rawPayload);
          const latestHistoryDate = payload.history.at(-1).date;
          const logCreatedAt = moment(latestHistoryDate).format("YYYY-MM-DD HH:mm");
          return logCreatedAt == createdDate;
        });

        if (found) {              
          resolve(true)
        } else {
          resolve(false)
        }
      } else {
        resolve(false)
      }
    })
  }

  protected mapOriginCode(originData : any) {
    if (originData.origin_code) {
      return originData.origin_code;
    }

    const tariffCodeLength = originData.tariff_code.length;
    const slicedTariffCode = originData.tariff_code.substring(0, tariffCodeLength - 2);
    const originCode = slicedTariffCode + "00";
    return originCode;
  }

  protected checkServiceCode(serviceDisplay: string, serviceCode: string, serviceType: string) {
    if (serviceCode === serviceType) return true;
    
    if (serviceCode.startsWith(SERVICE_CTC)) {
      let svc_type = SERVICE_REG + serviceCode.substring(3);

      if (serviceDisplay !== SERVICE_CTC) {
        svc_type = serviceDisplay + serviceCode.substring(6);
      }

      if (svc_type === serviceType) return true;
    }

    return false;
  }

  protected async getMasterStatus(status : any) {
    const { ekspedisi_id, m_group_status_order } = status;
    const group_status_id = m_group_status_order[0].group_status_id;
    if (!group_status_id) throw new Error("Group status tidak ditemukan.");
    return await this.groupStatusOrderRepository.getJneMasterStatus(group_status_id, ekspedisi_id);
  }
}
