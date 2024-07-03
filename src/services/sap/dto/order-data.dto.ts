import OrderDataInterface from "../api/requests/order/order-data.interface";
import OrderShipmentDataInterface from "../api/requests/order/order-shipment-data.interface";
import OrderPickupDataInterface from "../api/requests/order/order-pickup-data.interface";
import OrderReceiverDataInterface from "../api/requests/order/order-receiver-data.interface";
import OrderShipperDataInterface from "../api/requests/order/order-shipper-data.interface";
import newlineCleanerHelper from "../../../helpers/newline-cleaner.helper";

export default class OrderDataDto implements OrderDataInterface {

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
  shipper_postal_code?: string | undefined;
  shipper_contact?: string | undefined;
  destination_district_code: string;
  receiver_name: string;
  receiver_address: string;
  receiver_phone: string;
  receiver_email?: string | undefined;
  receiver_postal_code?: string | undefined;
  receiver_contact?: string | undefined;

  constructor(
    shipmentData : OrderShipmentDataInterface,
    pickupData : OrderPickupDataInterface,
    receiverData : OrderReceiverDataInterface,
    shipperData : OrderShipperDataInterface  
  ) {
    this.customer_code = shipmentData.customer_code;
    this.koli          = shipmentData.koli;
    this.weight        = shipmentData.weight;
    this.volumetric    = shipmentData.volumetric;
    this.destination_district_code = shipmentData.destination_district_code;
    this.reference_no  = shipmentData.reference_no;
    this.service_type_code = shipmentData.service_type_code;
    this.shipment_type_code  = shipmentData.shipment_type_code;
  
    this.pickup_name   = newlineCleanerHelper(pickupData.name);
    this.pickup_address= newlineCleanerHelper(pickupData.address);
    this.pickup_phone  = pickupData.phone;
    this.pickup_place  = parseInt(pickupData.place);
    this.pickup_email = newlineCleanerHelper(pickupData.email);
    this.pickup_contact = newlineCleanerHelper(pickupData.contact);
    this.pickup_district_code = pickupData.district_code;
  
    this.shipper_name  = newlineCleanerHelper(shipperData.name);
    this.shipper_address = newlineCleanerHelper(shipperData.address);
    this.shipper_phone = shipperData.phone;
    if (shipperData.contact) this.shipper_contact = newlineCleanerHelper(shipperData.contact);
    if (shipperData.postal_code) this.shipper_postal_code = shipperData.postal_code;
    
    this.receiver_name = newlineCleanerHelper(receiverData.name);
    this.receiver_address  = newlineCleanerHelper(receiverData.address);
    this.receiver_phone  = receiverData.phone;
    if (receiverData.contact) this.receiver_contact = newlineCleanerHelper(receiverData.contact);
    if (receiverData.postal_code) this.receiver_postal_code = receiverData.postal_code;
    
    if (shipmentData.awb_no)  this.awb_no = shipmentData.awb_no;
    if (shipmentData.cod_value) this.cod_value = shipmentData.cod_value;
  
    if (shipmentData.shipment_content_code) this.shipment_content_code = shipmentData.shipment_type_code;
    if (shipmentData.description_item) this.description_item = newlineCleanerHelper(shipmentData.description_item);
    if (shipmentData.packing_type_code) this.packing_type_code = shipmentData.packing_type_code;
    if (shipmentData.insurance_type_code) {
      this.insurance_type_code = shipmentData.insurance_type_code;
      if (shipmentData.item_value) {
        this.item_value = shipmentData.item_value
      } else {
        throw new Error("Nilai barang tidak boleh kosong.");
      }
    }
  }

}