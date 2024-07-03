import BuyerInterface from "./buyer.interface";
import PickupAddressInterface from "./pickup-address.interface";
import ProductInterface from "./product.interface";
import SellerInterface from "./seller.interface";

export default interface OrderRequestInterface {
  order_id : string;
  seller_id : string;
  seller_company_name : string;
  service_type : string;
  from : SellerInterface;
  to : BuyerInterface;
  weight : number;
  items : ProductInterface[];
  delivery_start_date : string;
  isCod : boolean;
  isPickup : boolean;
  cod_price : number;
  pickup : PickupAddressInterface;
  insured_value? : number;
}