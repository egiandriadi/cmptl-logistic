import ServiceCostInterface from "./service-cost.interface";

export default interface ShipmentCostDataInterface {
  origin : string;
  destination : string;
  coverage_cod : boolean;
  services : ServiceCostInterface[];
}