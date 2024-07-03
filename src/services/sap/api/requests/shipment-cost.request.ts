import ShipmentCostRequestInterface from "./shipment-cost.request.interface";

export default class ShipmentCostRequest implements ShipmentCostRequestInterface {
  origin: String;
  destination: String;
  weight: String;
  customer_code: String;
  packing_type_code?: String | undefined;
  volumetric?: String | undefined;
  insurance_type_code?: String | undefined;
  item_value?: String | undefined;
}