import _ from "lodash";

const MapServices = (price : any) : ServiceCost[] => {
  return _.map(price, (p) => {
    const obj = new ServiceCost;
      obj.origin_name  = p.origin_name;
      obj.destination_name  = p.destination_name;
      obj.service_display  = p.service_display;
      obj.service_code = p.service_code;
      obj.goods_type  = p.goods_type;
      obj.currency  = p.currency;
      obj.price  = p.price;
      obj.etd_from  = p.etd_from;
      obj.etd_thru  = p.etd_thru;
      obj.times  = p.times;
      return obj;
    })
}

class ServiceCost {
  origin_name: string;
  destination_name: string;
  service_display: string;
  service_code: string;
  goods_type: string;
  currency: string;
  price: string;
  etd_from: string;
  etd_thru: string;
  times: string;
}

export default class CheckTariffResponseDto {
	price: ServiceCost[];

  constructor(data : any) {
    this.price = MapServices(data.price);
  }

  getServices() : ServiceCost[] {
    return this.price;
  }
}