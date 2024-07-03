import ServiceCostInterface from "./service-cost.interface";
import ShipmentCostDataInterface from "./shipment-cost-data.interface";

export default class ShipmentCostData implements ShipmentCostDataInterface {
  origin: string;
  destination: string;
  coverage_cod: boolean;
  services: ServiceCostInterface[];
}