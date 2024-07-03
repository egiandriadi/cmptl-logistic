import CreatedOrderData from "./created-order-data";

export default interface CreateOrderResponseInterface {
  status : string,
  data : CreatedOrderData,
  msg : string
}