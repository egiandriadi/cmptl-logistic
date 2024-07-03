import ServiceCostInterface from "./service-cost.interface";

export default class ServiceCost implements ServiceCostInterface {
  minimum_kilo: number;
  insurance_cost: number;
  insurance_admin_cost: number;
  volumetric_kg: number;
  packing_cost: string;
  weight: number;
  final_weight: number;
  kilo_divider: string;
  cost: string;
  discount: string;
  total_cost: number;
  service_type_code: string;
  service_type_name: string;
  sla: string;
}