import OrderPickupData from "../api/requests/order/order-pickup-data";
import OrderPickupDataInterface from "../api/requests/order/order-pickup-data.interface";

export default class OrderPickupDataDto implements OrderPickupDataInterface {
  
  name: string;
  address: string;
  phone: string;
  place: string;
  district_code: string;
  contact: string;
  email: string;
  latitude?: string | undefined;
  longitude?: string | undefined;
  
  constructor(
    name : string,
    address : string,
    phone : string,
    district_code : string,
    place : string,
    email : string,
    contact : string  
  ) {

    this.name = name;
    this.address = address;
    this.phone = phone;
    this.district_code = district_code;
    this.place = place;
    this.email = email;
    this.contact = contact;

  }

  static hydrate(
    name : string,
    address : string,
    phone : string,
    district_code : string,
    place : string,
    email : string,
    contact : string  
  ) {
    return new OrderPickupDataDto(
      name,
      address,
      phone,
      district_code,
      place,
      email,
      contact
    );
  }

}
