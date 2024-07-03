import OrderReceiverDataInterface from "../api/requests/order/order-receiver-data.interface";

export default class OrderReceiverDataDto implements OrderReceiverDataInterface {
  
  name: string;
  address: string;
  phone: string;
  email?: string | undefined;
  postal_code?: string | undefined;
  contact?: string | undefined;

  constructor(
    name : string, 
    address : string, 
    phone : string, 
    contact : string,
    postal_code : string | undefined = undefined
  ) {
    this.name    = name;
    this.address = address;
    this.phone   = phone;
    this.contact = contact;  
    if (postal_code) this.postal_code = postal_code;
  }

  static hydrate(
    name : string, 
    address : string, 
    phone : string, 
    contact : string,
    postal_code : string | undefined = undefined
  ) {
    return new OrderReceiverDataDto(name, address, phone, contact, postal_code);
  }

}
