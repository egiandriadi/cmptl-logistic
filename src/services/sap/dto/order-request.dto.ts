import { Request } from "express";
import _ from "lodash";
import Product from "../../../libs/order/product";
import Seller from "../../../libs/order/seller";
import Buyer from "../../../libs/order/buyer";
import PickupAddress from "../../../libs/order/pickup-address";
import OrderRequestInterface from "../../../libs/order/order-request.interface";
import BuyerInterface from "../../../libs/order/buyer.interface";
import PickupAddressInterface from "../../../libs/order/pickup-address.interface";
import ProductInterface from "../../../libs/order/product.interface";
import SellerInterface from "../../../libs/order/seller.interface";
import OrderPayloadInterface from "../../../repositories/interfaces/order-payload.interface";

export default class OrderRequestDto implements OrderRequestInterface, OrderPayloadInterface {

  order_id: string;
  seller_id: string;
  seller_company_name: string;
  service_type: string;
  from: SellerInterface;
  to: BuyerInterface;
  weight: number;
  items: ProductInterface[];
  delivery_start_date: string;
  isCod: boolean;
  isPickup: boolean;
  cod_price: number;
  pickup: PickupAddressInterface;
  insured_value?: number | undefined;

  constructor(req : Request) {

    const { body } = req
    const { from, to, items, pickup } = body;

    let seller = new Seller;
    seller.name = from.name;
    seller.phone = from.phone;
    seller.address = from.address;
    seller.province = from.province;
    seller.city  = from.city;
    seller.kecamatan = from.kecamatan;
    seller.zipcode = from.zipcode;
    seller.wilayah_id = from.wilayah_id;

    let buyer = new Buyer;
    buyer.name = to.name;
    buyer.phone = to.phone;
    buyer.address = to.address;
    buyer.province = to.province;
    buyer.city  = to.city;
    buyer.kecamatan = to.kecamatan;
    buyer.zipcode = to.zipcode;
    buyer.wilayah_id = to.wilayah_id;

    let pickupAddress = new PickupAddress;
    pickupAddress.name  = pickup.name;
    pickupAddress.address = pickup.address;
    pickupAddress.phone = pickup.phone;
    pickupAddress.date = pickup.date;
    pickupAddress.province  = pickup.province;
    pickupAddress.city  = pickup.city;
    pickupAddress.kecamatan = pickup.kecamatan;
    pickupAddress.zipcode = pickup.zipcode;
    pickupAddress.email = pickup.email;
    pickupAddress.wilayah_id = pickup.wilayah_id;

    this.order_id = body?.order_id;
    this.seller_id = body?.seller_id;
    this.seller_company_name = body?.seller_company_name;
    this.service_type = body?.service_type;
    this.from  = seller;
    this.to    = buyer;
    this.weight = body?.weight;
    this.items = this.mapProducts(body?.items)
    this.delivery_start_date = body?.delivery_start_date;
    this.isPickup  = body?.isPickup;
    this.isCod = body?.isCod;
    this.cod_price = body?.cod_price;
    this.pickup = pickupAddress;    
    if (body.insured_value) this.insured_value = body.insured_value;
  
  }

  mapProducts(items: any[]) {
    return _.map(items, (item) => {
      let obj = new Product;
      obj.item_description = item.item_description;
      obj.quantity  = item.quantity;
      return obj;
    })
  }

}
