import PickupAddressInterface from "./pickup-address.interface";

export default class PickupAddress implements PickupAddressInterface {
  name : string;
  phone : string;
  address : string;
  date : string;
  province : string;
  city : string;
  kecamatan : string;
  zipcode : string;
  email : string;
  wilayah_id : number;
}