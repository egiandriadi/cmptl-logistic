import OrderPayloadInterface from "../../../../../repositories/interfaces/order-payload.interface";
import OrderDataInterface from "./order-data.interface";

export default class OrderData implements OrderDataInterface, OrderPayloadInterface {

  customer_code: string;
  awb_no?: string | undefined;
  reference_no: string;
  service_type_code: string;
  pickup_name: string;
  pickup_address: string;
  pickup_phone: string;
  pickup_place: number;
  pickup_email?: string | undefined;
  pickup_postal_code?: number | undefined;
  pickup_contact?: string | undefined;
  pickup_latitude?: string | undefined;
  pickup_longitude?: string | undefined;
  pickup_district_code: string;
  pickup_type_code: string;
  koli: string;
  weight: number;
  volumetric: string;
  shipment_type_code: string;
  shipment_content_code?: string | undefined;
  shipment_label_flag?: number | undefined;
  description_item?: string | undefined;
  packing_type_code?: string | undefined;
  item_value?: string | undefined;
  insurance_type_code?: string | undefined;
  cod_value?: string | undefined;
  shipper_name: string;
  shipper_address: string;
  shipper_phone: string;
  shipper_email?: string | undefined;
  shipper_contact?: string | undefined;
  shipper_postal_code?: string | undefined;
  destination_district_code: string;
  receiver_name: string;
  receiver_address: string;
  receiver_phone: string;
  receiver_email?: string | undefined;
  receiver_postal_code?: string | undefined;
  receiver_contact?: string | undefined;
  
}