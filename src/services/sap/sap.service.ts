import SapLocationRepository from "../../repositories/sap-location.repository";
import ShipmentCostRequestDto from "./api/dto/shipment-cost-request.dto";
import SapApiService from "./api/sap-api-service";
import CustomerCode from "./api/constants/customer-code";
import _ from "lodash";
import CostDataDto from "./dto/cost-data.dto";
import { ResponseRecommendationDto } from "./dto/response-recommendation.dto";
import SapLocationRepositoryInterface from "../../repositories/sap-location.repository.interface";
import RegionRepositoryInterface from "../../repositories/region.repository.interface";
import RegionRepository from "../../repositories/region.repository";
import OrderRequestInterface from "../../libs/order/order-request.interface";
import OrderDataInterface from "./api/requests/order/order-data.interface";
import OrderShipmentDataDto from "./dto/order-shipment-data.dto";
import OrderReceiverDataDto from "./dto/order-receiver-data.dto";
import OrderPickupDataDto from "./dto/order-pickup-data.dto";
import OrderDataDto from "./dto/order-data.dto";
import OrderShipperDataDto from "./dto/order-shipper-data.dto";
import PickupCode from "./api/constants/pickup-code";
import Volumetric from "./api/constants/volumetric";
import ShipmentType from "./api/constants/shipment-type";
import AuditTrailRepository from "../../repositories/audit-trail.repository";
import config from "../../config/global.config";
import axios, { AxiosError, AxiosResponse } from "axios";
import CreatedOrderResponseDto from "./api/dto/created-order-response.dto";
import CreatedOrderDataInterface from "./api/responses/created-order-data.interface";
import { UpdateLogsAuditTrailDto } from "../../repositories/dto/update-logs-audit-trail.dto";
import { CreateAuditTrailDto } from "../../repositories/dto/create-audit-trail.dto";
import CancelOrderRequestDto from "./api/dto/cancel-order-request.dto";
import StatusOrderRepository from "../../repositories/status-order.repository";
import OrderRepository from "../../repositories/order.repository";
import EkspedisiRepository from "../../repositories/ekspedisi.repository";
import CancelOrderResponseDto from "./api/dto/cancel-order-response.dto";
import { concatMap, from, mergeMap, Observable } from "rxjs";
import CheckCostFromApiDto from "./dto/check-cost-from-api.dto";
import InsuranceType from "./api/constants/insurance-type";
import TrackRequestDto from "./api/dto/track-request.dto";
import EkspedisiLogRepository from "../../repositories/ekspedisi-log.repository";
import EkspedisiLogRepositoryInterface from "../../repositories/ekspedisi-log.repository.interface";
import { EXPEDITION_CODE } from "../../constants/expedition-code";
import { subscribe } from "diagnostics_channel";
import { EXPEDITION_LOG_TYPE, WebhookServices } from "../webhook.service";
import WebhookRequestInterface from "../../libs/webhook/webhook-request.interface";
import TrackHistoryDto from "./api/dto/track-history.dto";
import moment from "moment";

const DEFAULT_KOLI = "1";
const DEFAULT_WEIGHT = "1";

export class SapService {
  regionRepository: RegionRepositoryInterface;
  sapLocationRepository: SapLocationRepositoryInterface;
  ekspedisiLogRepository: EkspedisiLogRepositoryInterface;
  sapApiService: SapApiService;
  customerCode = CustomerCode;

  constructor() {
    this.regionRepository = new RegionRepository();
    this.sapLocationRepository = new SapLocationRepository();
    this.sapApiService = new SapApiService();
    this.ekspedisiLogRepository = new EkspedisiLogRepository();
  }

  async checkRegion(id: any): Promise<any> {
    const region = await this.regionRepository.getById(id);
    if (!region) throw new Error("Region tidak valid");
    const regionCode = region.kode_wilayah;
    const sapLocation = await this.sapLocationRepository.getByWilayahCode(
      regionCode
    );
    if (!sapLocation) throw new Error("Region tidak valid");
    return {
      region,
      sapLocation,
    };
  }

  async checkRegionfromApi(zoneCode: string) {}

  async checkCostFromApi(checkCostFromApiDto: CheckCostFromApiDto) {
    const transactionTypeCode = this.checkTransactionType(
      checkCostFromApiDto.isCod,
      checkCostFromApiDto.destination_cod_coverage,
      true
    );
    const parsedWeight = checkCostFromApiDto.weight || DEFAULT_WEIGHT;
    //const calculatedWeight  = this.calculateWeight(parseFloat(parsedWeight))
    const shipmentCostRequestDto = ShipmentCostRequestDto.hydrate(
      checkCostFromApiDto.origin_district_code,
      checkCostFromApiDto.destination_district_code,
      parsedWeight,
      transactionTypeCode
    );
    const shipmentCostDataDto = await this.sapApiService.getShipmentCost(
      shipmentCostRequestDto
    );
    const selectedService = _.find(
      shipmentCostDataDto.services,
      cost => cost.service_type_code === checkCostFromApiDto.service_type
    );
    if (!selectedService) throw new Error("Service tidak ditemukan");
    const costDataDto = new CostDataDto(
      shipmentCostDataDto.origin,
      shipmentCostDataDto.destination,
      selectedService.service_type_code,
      selectedService.total_cost
    );
    return costDataDto;
  }

  async getTarifRecommendation(checkCostFromApiDto: CheckCostFromApiDto, origin:any, destination:any): Promise<ResponseRecommendationDto> {
    const originRegion = await this.regionRepository.getById(origin);
    const destinationRegion = await this.regionRepository.getById(destination);

    if (!originRegion || !destinationRegion) throw new Error("Wilayah tidak valid");

    const transactionTypeCode = this.checkTransactionType(
      checkCostFromApiDto.isCod,
      checkCostFromApiDto.destination_cod_coverage,
      true
    );
    const parsedWeight = checkCostFromApiDto.weight || DEFAULT_WEIGHT;
    //const calculatedWeight  = this.calculateWeight(parseFloat(parsedWeight))
    const shipmentCostRequestDto = ShipmentCostRequestDto.hydrate(
      checkCostFromApiDto.origin_district_code,
      checkCostFromApiDto.destination_district_code,
      parsedWeight,
      transactionTypeCode
    );
    const shipmentCostDataDto = await this.sapApiService.getShipmentCost(
      shipmentCostRequestDto
    );
    const selectedService = _.find(
      shipmentCostDataDto.services,
      cost => cost.service_type_code === checkCostFromApiDto.service_type
    );
    if (!selectedService) throw new Error("Service tidak ditemukan");


    console.log("🚀 ~ SapService ~ getTarifRecommendation ~ checkCostFromApiDto:", checkCostFromApiDto)

    const ekspedisiRepository =  new EkspedisiRepository();
    const layanan = await ekspedisiRepository.findLayanan("sap", checkCostFromApiDto.service_type);
  
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
        services: selectedService.service_type_code,
        amount: selectedService.total_cost
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
        services: checkCostFromApiDto.service_type,
        amount: 0,
      }
      return response;
      
    }
  }
  async createOrder(
    orderRequest: OrderRequestInterface
  ): Promise<CreatedOrderDataInterface | undefined> {
    const AUDIT_TRAIL_TITLE = "Generate Resi SAP";

    const auditTrailRepository = new AuditTrailRepository();
    const order = await this.mapOrderRequest(orderRequest);
    const auditTrail = CreateAuditTrailDto.hydrate(
      AUDIT_TRAIL_TITLE,
      orderRequest.order_id,
      JSON.stringify(order),
      200
    );
    const auditTrailModel = await auditTrailRepository.create(auditTrail);

    try {
      const response = await this.sapApiService.createOrder(order);
      const createdOrder: CreatedOrderDataInterface =
        CreatedOrderResponseDto.hydrate(response);
      const auditTrailUpdatePayload = JSON.stringify(createdOrder);
      const updateLogsAuditTrailDto = UpdateLogsAuditTrailDto.hydrate(
        auditTrailUpdatePayload,
        200
      );
      await auditTrailRepository.updateLogsById(
        auditTrailModel.id,
        updateLogsAuditTrailDto
      );
      return createdOrder;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log("❗err:" + err);
        const payload = err.response?.data;
        const errorStatusCode = err.response?.status as number;
        const updateLogsAuditTrailDto = UpdateLogsAuditTrailDto.hydrate(
          JSON.stringify(payload),
          errorStatusCode
        );
        await auditTrailRepository.updateLogsById(
          auditTrailModel.id,
          updateLogsAuditTrailDto
        );
        throw new Error(payload?.msg);
      } else if (err instanceof Error) {
        console.log("❗err:" + err);
        // redirect error
        throw err;
      }
    }
  }

  async cancelOrder(orderUUIDs: string[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const CANCELLED_STATUS = "VOID";
        const EKSPEDISI_CODE = "sap";

        const ekspedisiRepository = new EkspedisiRepository();
        const orderRepository = new OrderRepository();
        const auditTrailRepository = new AuditTrailRepository();

        const ekspedisiModel = await ekspedisiRepository.findByCode(
          EKSPEDISI_CODE
        );

        if (!ekspedisiModel) throw new Error("Ekspedisi not found");

        const orders = await orderRepository.getByUUIDs(
          orderUUIDs,
          ekspedisiModel.id
        );

        console.debug('🚀 ~ SapApiService ~ orders found: ' + JSON.stringify(_.map(orders, (order) => order.uuid)));

        if (orders.length < 1) throw new Error("Data orders not found");

        let successCount = 0;
        let errorCount = 0;

        from(orders).pipe(
          mergeMap((order: any) => {
            return new Observable((subscribe) => {
              try {
                const TITLE = "Cancel Order SAP";
                const { nomor_resi, id } = order;
                const orderData = CancelOrderRequestDto.hydrate(nomor_resi);
                this.sapApiService.cancelOrder(orderData).then((response) => {
                  const cancelOrderResponse = CancelOrderResponseDto.hydrate(
                    response.data
                  );
                  const createAuditTrailDto = CreateAuditTrailDto.hydrate(
                    TITLE,
                    id.toString(),
                    nomor_resi,
                    200,
                    JSON.stringify(cancelOrderResponse)
                  );
                  return auditTrailRepository.create(createAuditTrailDto);
                }).then(() => {
                  return orderRepository.updateStatus(id, CANCELLED_STATUS);
                }).then(() => {
                  subscribe.next(true);
                  subscribe.complete();      
                }).catch((err) => { 
                  if (axios.isAxiosError(err)) {
                    const error = err as AxiosError;
                    const cancelOrderResponse = new CancelOrderResponseDto(
                      error?.response?.data
                    );
                    const createAuditTrailDto = CreateAuditTrailDto.hydrate(
                      TITLE,
                      id.toString(),
                      nomor_resi,
                      error?.response?.status || 400,
                      JSON.stringify(cancelOrderResponse)
                    );
                    auditTrailRepository.create(createAuditTrailDto)
                    .then(() => {
                      subscribe.next(false);
                      subscribe.complete();
                    })
                    .catch((auditTrailErr) => {
                      console.log("❗err:" + auditTrailErr);
                      subscribe.next(false);
                      subscribe.complete();
                    });
                  } else {
                    console.log("❗err:" + err);
                    subscribe.error(false)
                    subscribe.complete();
                  }
                });
              } catch (err) {
                console.log("❗err:" + err);
                subscribe.next(false);
                subscribe.complete()
              }
            })
          })
        ).subscribe({
          next: res => {
            res === true ? successCount++ : errorCount++;
          },
          error: err => {
            console.log("❗err:" + err);
          },
          complete: () => {
            resolve({
              success: successCount,
              error: errorCount,
            });
          },
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  protected async mapOrderRequest(
    order: OrderRequestInterface
  ): Promise<OrderDataInterface> {
    const orderRepository = new OrderRepository();
    const sapLocationRepository = new SapLocationRepository();
    const regionRepository = new RegionRepository();
    const { from, to, pickup, items, isCod, cod_price, insured_value } = order;
    const service_type_code = order.service_type;
    const pickupType =
      order.isPickup === true ? PickupCode.PICKUP : PickupCode.DROP_OFF;

    const item = items[0];
    const koli = items.length.toString();//item.quantity;

    const pickupWilayahId = pickup.wilayah_id;
    if (!pickupWilayahId) throw new Error("ID Wilayah Pickup tidak ditemukan.");
    const destinationWilayahId = to.wilayah_id;
    if (!destinationWilayahId)
      throw new Error("ID Wilayah Tujuan tidak ditemukan.");
    const originWilayah = await regionRepository.getById(pickupWilayahId);
    const originRegionCode = originWilayah?.kode_wilayah;
    if (!originWilayah || !originRegionCode)
      throw new Error("Lokasi tidak valid.");
    const destinationWilayah = await regionRepository.getById(
      destinationWilayahId
    );
    const destinationRegionCode = destinationWilayah?.kode_wilayah;
    if (!destinationWilayah || !destinationRegionCode)
      throw new Error("Lokasi tidak valid.");
    const pickupLocation = await sapLocationRepository.getByWilayahCode(
      originRegionCode
    );
    if (!pickupLocation) throw new Error("Lokasi tidak valid");
    const destinationLocation = await sapLocationRepository.getByWilayahCode(
      destinationRegionCode
    );
    if (!destinationLocation) throw new Error("Lokasi tidak valid");

    const pickupDistrictCode = pickupLocation.district_code as string;
    const destinationDistrictCode = destinationLocation.district_code as string;
    if (!pickupDistrictCode || !destinationDistrictCode)
      throw new Error("Lokasi tidak valid");
    const volumetric = Volumetric.DEFAULT;
    const pickupEmail: string = pickup.email ?? from.email ?? config.sap.default_email;
    const codPrice = cod_price ? cod_price.toString() : undefined;
    //const weight = this.calculateWeight(order.weight);
    const codCoverage = destinationLocation.cod_coverage as boolean;
    const transactionTypeCode = this.checkTransactionType(isCod, codCoverage);
    const insuranceTypeCode = this.checkInsurance(insured_value);
    const shipmentData = new OrderShipmentDataDto(
      transactionTypeCode,
      order.order_id,
      koli,
      order.weight,
      service_type_code,
      volumetric,
      destinationDistrictCode,
      ShipmentType.PACKAGE,
      ShipmentType.PACKAGE,
      item.item_description,
      codPrice,
      insuranceTypeCode,
      order.insured_value || undefined
    );
    const shipperData = OrderShipperDataDto.hydrate(
      from.name,
      from.address,
      from.phone,
      from.name,
      from.zipcode
    );
    const receiverData = OrderReceiverDataDto.hydrate(
      to.name,
      to.address,
      to.phone,
      to.name,
      to.zipcode
    );
    const pickupData = OrderPickupDataDto.hydrate(
      pickup.name,
      pickup.address,
      pickup.phone,
      pickupDistrictCode,
      pickupType,
      pickupEmail,
      pickup.name
    );
    const obj = new OrderDataDto(
      shipmentData,
      pickupData,
      receiverData,
      shipperData
    );
    return obj;
  }

  protected checkTransactionType(
    isCodRequest: boolean,
    coverage: boolean,
    isProd : boolean = false
  ): string {
    if (isCodRequest) {
      if (coverage === true) {
        return (isProd ? CustomerCode.PROD_COD_ACCOUNT : CustomerCode.COD_ACCOUNT) || "";
      } else {
        throw new Error("Wilayah tidak tercover COD.");
      }
    } else {
      return (isProd ? CustomerCode.PROD_NON_COD_ACCOUNT : CustomerCode.NON_COD_ACCOUNT) || "";
    }
  }

  async getTrackingStatus(awb: string) {

    try {

      const webhookService = new WebhookServices;
      const trackRequest = TrackRequestDto.hydrate(awb);
      const webhookLogs = await this.ekspedisiLogRepository.getByAwb(EXPEDITION_CODE.SAP, awb);
      const res = await this.sapApiService.track(trackRequest);
      console.log("🚀 ~ SapService ~ trackStatus:" + JSON.stringify(res.data))
      const { data } = res.data

      if (data.length === 0) throw new Error("No events yet.");

      const webhookDatas = _.map(data, (history, index) => {
        return TrackHistoryDto.hydrate(history)
      });

      let trackObservables;
      let insertLogFlag = true;
      let forceUpdate = false;

      const filteredData = _.filter(webhookDatas, (history, index) => {
        const found = _.find(webhookLogs, (log, index) => {
          const rawPayload  = log.raw;
          const payload     = JSON.parse(rawPayload);
          return payload.created_at === history.created_at;
        });
        if (found) {
          return false;
        } else {
          return true;
        }
      });

      if (filteredData.length === 0) {
        //return data
        const latestItem = _.first(_.orderBy(webhookDatas, [(webhook) => moment(webhook.created_at).unix() ], [ 'desc' ]));
        if (!latestItem) throw new Error("Latest item not found.");
        trackObservables = [latestItem];
        insertLogFlag = false;
        forceUpdate = true; // force status update
      } else {
        trackObservables = filteredData;
      }

      from(trackObservables).pipe(concatMap((history, index) => {
        return new Observable( subscribe => {

          const isLastItem : boolean = (filteredData.length - 1) === index;
          const createdAt = moment(history.created_at).unix();
          let updateStatus : boolean = false;

          const webhookData : WebhookRequestInterface = {
            awb: history.awb_no,
            expedition_code: EXPEDITION_CODE.SAP,
            status: history.rowstate_name,
            timestamp: moment(history.created_at).format("YYYY-MM-DD HH:mm:ss"),
            payload: history
          }

          if (forceUpdate === true) {
            updateStatus = true;
          } else if (isLastItem) {
            // check for newer statuses, don't update order status if there are newer status
            const newerData = _.filter(webhookLogs, (log) => {
              const rawPayload  = log.raw;
              if (!rawPayload) return false;
              const payload     = JSON.parse(rawPayload);
              return moment(payload.created_at).unix() > moment(history.created_at).unix();
            });

            updateStatus = newerData.length > 0 ? false : true;
          }

          webhookService.updateStatus(webhookData, updateStatus, EXPEDITION_LOG_TYPE.TRACK, createdAt, insertLogFlag)
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
        next: (data) => {
          console.log(data)
        },
        error: (data) => {
          
        },
        complete: () => {
          console.log("🚀 ~ SapService ~ trackStatus: Mapping completed.");
        }
      })

      return data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log("❗axiosErr:" + err);
        const payload = err.response?.data;
        throw new Error(payload?.msg);
      } else if (err instanceof Error) {
        console.log("❗err:" + err);
        // redirect error
        throw err;
      }
    }
  }

  async parseStatus(awb : string) {
    try {

      const logs = await this.ekspedisiLogRepository.getByAwb(EXPEDITION_CODE.SAP, awb);
      const trackStatus = await this.getTrackingStatus(awb);
      return trackStatus;

    } catch (err) {
      throw err
    }   
  }

  protected checkInsurance(insured_value : number | undefined) {
    return (insured_value ? InsuranceType.REGULAR_PACKAGE : undefined)
  }

  protected calculateWeight(weight : number) : number {
    const fixedWeight = parseFloat(weight.toFixed(1))
    const modWeight = fixedWeight % 1;
    const roundedModWeight = parseFloat(modWeight.toFixed(1));
    if (roundedModWeight <= 0.2) {
      return Math.floor(weight);
    } else {
      return Math.ceil(weight);
    }
  }
}
