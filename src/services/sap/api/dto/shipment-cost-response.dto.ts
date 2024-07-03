import _ from "lodash";
import ShipmentCostData from "../responses/shipment-cost-data";
import ShipmentCostResponse from "../responses/shipment-cost.response";
import ShipmentCostResponseInterface from "../responses/shipment-cost.response.interface";
import ServiceCost from "../responses/service-cost";
import ShipmentCostDataInterface from "../responses/shipment-cost-data.interface";
import ServiceCostInterface from "../responses/service-cost.interface";

export default class ShipmentCostDataDto implements ShipmentCostDataInterface {

  origin: string;
  destination: string;
  coverage_cod: boolean;
  services: ServiceCostInterface[];

  constructor(res : any) {
    const { data } = this.mapResponse(res);
    this.origin = data.origin;
    this.destination = data.destination;
    this.coverage_cod = data.coverage_cod;
    this.services = data.services;
  }

  public getServices() : ServiceCost[] {
    return this.services;
  }

  protected mapServices = (data : any) : ServiceCost[] => {
    return _.map(data, (d) => {
      const obj = new ServiceCost;
      obj.minimum_kilo  = d.minimum_kilo;
      obj.insurance_cost  = d.insurance_cost;
      obj.insurance_admin_cost  = d.insurance_admin_cost;
      obj.volumetric_kg = d.volumetric_kg;
      obj.packing_cost  = d.packing_cost;
      obj.weight  = d.weight;
      obj.final_weight  = d.final_weight;
      obj.kilo_divider  = d.kilo_divider;
      obj.cost  = d.cost;
      obj.discount  = d.discount;
      obj.total_cost  = d.total_cost;
      obj.service_type_code = d.service_type_code;
      obj.service_type_name = d.service_type_name;
      obj.sla = d.sla;
      return obj;
    })
  }
  
  protected mapData = (data : any) : ShipmentCostData => {
    const obj = new ShipmentCostData;
    obj.origin = data.origin;
    obj.destination = data.destination;
    obj.coverage_cod = data.coverage_cod;
    obj.services = this.mapServices(data.services);
    return obj;
  }
  
  protected mapResponse = (res : any) : ShipmentCostResponseInterface => {
    const obj = new ShipmentCostResponse(res);
    obj.status = res.status;
    obj.data = this.mapData(res.data)
    return obj;
  }  

  static hydrate(res : any) : ShipmentCostDataInterface{
    return new ShipmentCostDataDto(res);
  }

}
