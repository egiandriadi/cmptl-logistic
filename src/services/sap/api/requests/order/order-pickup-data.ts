import OrderPickupDataInterface from "./order-pickup-data.interface";

export default class OrderPickupData implements OrderPickupDataInterface {
  name: string;
  address: string;
  phone: string;
  place: string;
  district_code: string;
  contact: string;
  email: string;
  latitude?: string | undefined;
  longitude?: string | undefined;
}