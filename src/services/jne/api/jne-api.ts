import JneApiInterface from "./jne-api.interface";
import ApiEndpoints from "./constants/api-endpoints"; 
import config from "../../../config/global.config";

export default class JneApi implements JneApiInterface {
  protected baseUrl? : string;
  protected productionBaseUrl? : string;

  constructor() {
    this.baseUrl = config.jne.base_url;
    this.productionBaseUrl = config.jne.production.base_url;
  }

  checkTariff(): string {
    return this.productionBaseUrl + ApiEndpoints.API_TARIFF;
  }

  createOrder(): string {
    return this.baseUrl + ApiEndpoints.API_PICKUP;
  }

  cancelOrder(): string {
    return this.baseUrl + ApiEndpoints.API_CANCEL;
  }

  trackStatus(): string {
    return this.productionBaseUrl + ApiEndpoints.API_TRACKING;
  }
}