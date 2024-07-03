export default class RequestOrderDto {
  order_id: string;
  seller_id: string;
  seller_company_name: string;
  service_type: string;
  from: AddressDetail;
  to: AddressDetail;
  weight: number;
  items: ItemDetail[];
  delivery_start_date: string;
  isCod: boolean;
  isPickup: boolean;
  cod_price: number;
  pickup: PickupDetail;
  insured_value: number | undefined; // optional
  delivery_notes: string | undefined; // optional
}

class ItemDetail {
  item_description: string;
  quantity: number;
}

class PickupDetail {
  name: string;
  phone: string;
  address: string;
  date: string;
  province: string;
  city: string;
  kecamatan: string;
  zipcode: string;
}

class AddressDetail {
  name: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  kecamatan: string;
  zipcode: string;
  service: string;
  vehicle: string;
  email: string | undefined; // optional
}