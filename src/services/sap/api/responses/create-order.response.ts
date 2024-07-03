import CreateOrderResponseInterface from "./create-order.response.interface";
import CreatedOrderData from "./created-order-data";

export default class CreateOrderResponse implements CreateOrderResponseInterface {

  status: string;
  data: CreatedOrderData;
  msg: string;

  constructor(resBody : any) {
    this.status = resBody?.status;
    this.data = resBody?.data as CreatedOrderData;
    this.msg  = resBody?.msg;
  }

}