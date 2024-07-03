export default interface ShipmentCostRequestInterface {
  origin : String;
  destination : String;
  weight : String;
  customer_code : String;
  packing_type_code? : String;
  volumetric? : String;
  insurance_type_code? : String;
  item_value? : String;
}