import axios, { AxiosResponse } from "axios";
import { courierAxiosConfig, courierProductionAxiosConfig, warehouseAxiosConfig, warehouseProductionAxiosConfig } from "./config/axios-config";
import SapApiServiceInterface from "./sap-api-service.interface";
import DistrictDataInterface from "./responses/district-data.interface";
import CoverageAreaResponseDto from "./dto/coverage-area-response.dto";
import ShipmentCostDataDto from "./dto/shipment-cost-response.dto";
import SapApi from "./sap-api";
import OrderDataInterface from "./requests/order/order-data.interface";
import CancelOrderRequestInterface from "./requests/cancel-order.request.interface";
import ShipmentCostDataInterface from "./responses/shipment-cost-data.interface";
import TrackOrderRequestInterface from "./requests/track-order.request.interface";

const createOrderTestpoint = async (orderData : OrderDataInterface) => {
  return {} as AxiosResponse
}

export default class SapApiService implements SapApiServiceInterface {

  protected sapApi : SapApi;

  constructor() {
    this.sapApi = new SapApi();
  }

  async getCoverageArea() : Promise<DistrictDataInterface[]> {
    const res = await axios.get(this.sapApi.coverageArea());
    const coverageAreaResponseDto = new CoverageAreaResponseDto(res);
    return coverageAreaResponseDto.data;
  }

  async getShipmentCost(shipmentCostRequestDto : any): Promise<ShipmentCostDataInterface> {
    try {
      console.log("🚀 ~ SapApiService ~ getShipmentCost:", shipmentCostRequestDto);
      const res = await axios.post(this.sapApi.shipmentCost(), shipmentCostRequestDto, courierProductionAxiosConfig);
      const { msg } = res.data
      if (res.status !== 200) throw new Error(msg)
      return new ShipmentCostDataDto(res.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("❗err:" + JSON.stringify(error.response?.data))
        throw new Error(error.response?.data.msg);
      }
      else throw error; // pass error
    }
  }

  /**
   * Need axios response because we need to update audit trail
   * @param orderData 
   * @returns 
   */
  async createOrder(orderData : OrderDataInterface) : Promise<AxiosResponse> {
    console.log("🚀 ~ SapApiService ~ createOrder:", orderData);
    return await axios.post(this.sapApi.createOrder(), orderData, courierAxiosConfig);
    //const res = await createOrderTestpoint(orderData);
  }

  async cancelOrder(orderData: CancelOrderRequestInterface): Promise<AxiosResponse> {
    console.log("🚀 ~ SapApiService ~ cancelOrder:", orderData);
    return await axios.post(this.sapApi.cancelOrder(), orderData, courierAxiosConfig);
  }

  async track(awbData: TrackOrderRequestInterface): Promise<any> {
    console.log("🚀 ~ SapApiService ~ track status:", awbData);
    const axiosConfig = Object.assign({}, {
      params : {
        ...awbData
      }
    }, warehouseProductionAxiosConfig);
    return await axios.get(this.sapApi.trackingOrder(), axiosConfig);
  }
}