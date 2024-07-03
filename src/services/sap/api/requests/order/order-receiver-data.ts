import OrderReceiverDataInterface from "./order-receiver-data.interface";

export default class OrderReceiverData implements OrderReceiverDataInterface {
  name: string;
  address: string;
  phone: string;
  email?: string | undefined;
  postal_code?: string | undefined;
  contact?: string | undefined;
}