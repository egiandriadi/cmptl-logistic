import CancelOrderResponseInterface from "./cancel-order.response.interface";

export default class CancelOrderResponse implements CancelOrderResponseInterface{
  status: string;
  msg: string;
}