export default interface OrderShipmentDataInterface {
  customer_code : string,
  reference_no  : string,
  service_type_code : string,
  koli  : string,
  weight  : number,
  volumetric  : string,
  shipment_type_code : string,
  destination_district_code : string,
  awb_no? : string,
  shipment_content_code? : string,
  shipment_label_flag? : string,
  packing_type_code? : string,
  description_item? : string,
  item_value? : string,
  insurance_type_code? : string,
  cod_value? : string
}