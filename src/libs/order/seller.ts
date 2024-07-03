import SellerInterface from "./seller.interface";

export default class Seller implements SellerInterface {
  name : string;
  phone : string;
  address : string;
  province : string;
  city : string;
  kecamatan : string;
  zipcode : string;
  email? : string | undefined;
  wilayah_id: number;
}
