import SapApiInterface from "./sap-api.interface";
import ApiEndpoints from "./constants/api-endpoints"; 
import config from "../../../config/global.config";

export default class SapApi implements SapApiInterface {

  protected baseUrl? : string;
  protected warehouseUrl? : string;
  protected productionBaseUrl? : string;
  protected productionWarehouseUrl? : string;

  constructor() {
    this.baseUrl = config.sap.api_endpoint;
    this.warehouseUrl = config.sap.warehouse_endpoint;
    this.productionBaseUrl = config.sap.production.api_endpoint;
    this.productionWarehouseUrl = config.sap.production.warehouse_endpoint;
  }

  coverageArea(): string {
    return this.productionBaseUrl + ApiEndpoints.COVERAGE_AREA;
  }

  shipmentCost(): string {
    return this.productionBaseUrl + ApiEndpoints.SHIPMENT_COST;
  }

  createOrder(): string {
    return this.baseUrl + ApiEndpoints.SHIPMENT_PICKUP;
  }

  cancelOrder(): string {
    return this.baseUrl + ApiEndpoints.SHIPMENT_CANCEL;
  }

  trackingOrder() : string {
    return this.productionWarehouseUrl + ApiEndpoints.GET_TRACKING_ORDER;
  }

}