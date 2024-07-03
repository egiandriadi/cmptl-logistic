import Buyer from "./buyer";
import OrderRequestInterface from "./order-request.interface";
import PickupAddress from "./pickup-address";
import Product from "./product";
import Seller from "./seller";

export default class OrderRequest implements OrderRequestInterface {
  order_id : string;
  seller_id : string;
  seller_company_name : string;
  service_type: string;
  from : Seller;
  to : Buyer;
  weight : number;
  items : Product[];
  delivery_start_date : string;
  isPickup: boolean;
  isCod : boolean;
  cod_price : number;
  pickup : PickupAddress;
  insured_value?: number | undefined;
}