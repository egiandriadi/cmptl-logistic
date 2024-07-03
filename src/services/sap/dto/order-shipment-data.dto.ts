import OrderShipmentDataInterface from "../api/requests/order/order-shipment-data.interface";

export default class OrderShipmentDataDto implements OrderShipmentDataInterface {

  customer_code : string;
  reference_no : string;
  koli : string;
  weight : number;
  service_type_code : string;
  volumetric : string;
  destination_district_code : string;
  shipment_type_code : string;
  shipment_content_code : string;
  description_item? : string | undefined;
  cod_value? : string | undefined;
  item_value? : string | undefined;
  packing_type_code? : string | undefined;
  awb_no? : string | undefined;
  insurance_type_code?: string | undefined;

  constructor(
    customer_code : string,
    reference_no : string,
    koli : string,
    weight : number,
    service_type_code : string,
    volumetric : string,
    destination_district_code : string,
    shipment_type_code : string,
    shipment_content_code : string,
    description_item? : string | undefined,
    cod_value? : string | undefined,
    insurance_type_code? : string | undefined,
    item_value? : number | undefined,
    packing_type_code? : string | undefined,
    awb_no? : string | undefined  
  ) {

    this.customer_code = customer_code;
    this.reference_no  = reference_no;
    this.koli  = koli;
    this.weight = weight;
    this.service_type_code = service_type_code;
    this.volumetric  = volumetric;
    this.destination_district_code = destination_district_code;
    this.shipment_type_code = shipment_type_code;
    this.shipment_content_code = shipment_content_code;

    if (packing_type_code) this.packing_type_code = packing_type_code;
    if (cod_value) this.cod_value = cod_value;  
    if (insurance_type_code) this.insurance_type_code = insurance_type_code;
    if (item_value) this.item_value = item_value.toString();
    if (awb_no) this.awb_no = awb_no;
    if (description_item) this.description_item = description_item;
  }

  static hydrate(
    customer_code : string,
    reference_no : string,
    koli : string,
    weight : number,
    service_type_code : string,
    volumetric : string,
    destination_district_code : string,
    shipment_type_code : string,
    shipment_content_code : string,
    description_item? : string | undefined,
    cod_value? : string | undefined,
    insurance_type_code? : string | undefined,
    item_value? : number | undefined,
    packing_type_code? : string | undefined,
    awb_no? : string | undefined  
  ) {
    return new OrderShipmentDataDto(
      customer_code,
      reference_no,
      koli,
      weight,
      service_type_code,
      volumetric,
      destination_district_code,
      shipment_type_code,
      shipment_content_code,
      description_item = undefined,
      cod_value = undefined,
      insurance_type_code = undefined,
      item_value = undefined,
      packing_type_code = undefined,
      awb_no = undefined
    )

  }

}