import OrderShipperDataInterface from "./order-shipper-data.interface";

export default class OrderShipperData implements OrderShipperDataInterface {
  name: string;
  address: string;
  phone: string;
  email: string | undefined;
  postal_code?: string | undefined;
  contact?: string | undefined;
}