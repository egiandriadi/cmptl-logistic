import BuyerInterface from "./buyer.interface";

export default class Buyer implements BuyerInterface {
  name : string;
  phone : string;
  address : string;
  province : string;
  city : string;
  kecamatan : string;
  zipcode : string;
  wilayah_id : number;
}