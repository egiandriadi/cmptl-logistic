import OrderResponseInterface from "./order-response.interface";

export default class OrderResponse implements OrderResponseInterface {
  tracking_number: string;
  order_id: string;
  tlc_code: string | null;
}