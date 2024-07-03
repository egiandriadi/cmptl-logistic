import OrderShipmentDataInterface from "./order-shipment-data.interface";

export default class OrderShipmentData implements OrderShipmentDataInterface{
  customer_code: string;
  reference_no: string;
  service_type_code: string;
  koli: string;
  weight: number;
  volumetric: string;
  shipment_type_code: string;
  destination_district_code: string;
  awb_no?: string | undefined;
  shipment_content_code?: string | undefined;
  shipment_label_flag?: string | undefined;
  packing_type_code?: string | undefined;
  description_item?: string | undefined;
  item_value?: string | undefined;
  insurance_type_code?: string | undefined;
  cod_value?: string | undefined;
}