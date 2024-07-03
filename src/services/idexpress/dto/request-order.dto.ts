export class RequestOrderDto {
  order_id: string;
  seller_id: string;
  seller_company_name: string;
  service_level: string;
  service_type: string;
  from: {
    name: string;
    phone: string;
    address: string;
    province: string;
    city: string;
    kecamatan: string;
    zipcode: string;
    email?: string;
    wilayah_id: number;
  };
  to: {
    name: string;
    phone: string;
    address: string;
    province: string;
    city: string;
    kecamatan: string;
    zipcode: string;
    email?: string;
    wilayah_id: number;
  };
  weight: number;
  items: Items[];
  delivery_start_date: string;
  isCod: boolean;
  isPickup: boolean;
  cod_price: number;
  pickup: Pickup;
  insured_value?: number;
}

class Items {
  item_description: string;
  quantity: number;
}

class Pickup {
  name: string;
  phone: string;
  address: string;
  date: string;
  province: string;
  city: string;
  kecamatan: string;
  zipcode: string;
  email?: string;
  wilayah_id: number;
}
