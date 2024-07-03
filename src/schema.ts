import Joi from "joi";

export const checkTariffNinja = Joi.object().keys({
  origin: Joi.number().required(),
  destination: Joi.number().required(),
  serviceType: Joi.string().required(),
  weight: Joi.number(),
  isCod: Joi.boolean(),
});

export const checkTariffSap = Joi.object().keys({
  origin: Joi.number().required(),
  destination: Joi.number().required(),
  serviceType: Joi.string().required(),
  isCod: Joi.boolean(),
  weight: Joi.number(),
});

export const checkTariffRecommendation = Joi.object().keys({
  origin: Joi.number().required(),
  destination: Joi.number().required(),
  serviceType: Joi.string().required(),
  isCod: Joi.boolean(),
  weight: Joi.number(),
  exclude_expedition_code: Joi.string(),
});

export interface IItemsData {
  item_description: string;
  quantity: number;
  danger_good: boolean;
}
const itemsData = Joi.object().keys({
  item_description: Joi.string().required(),
  quantity: Joi.number(),
  danger_good: Joi.boolean(),
});

export const CreateNewOrder = Joi.object().keys({
  order_id: Joi.string().required(),
  seller_id: Joi.string().required(),
  seller_company_name: Joi.string().required(),
  service_type: Joi.string(),
  from: Joi.object().keys({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    kelurahan: Joi.string(),
    kecamatan: Joi.string().required(),
    city: Joi.string().required(),
    province: Joi.string().required(),
    postcode: Joi.string(),
    zipcode: Joi.string(),
    wilayah_id: Joi.number().required(),
    email: Joi.string(),
  }),
  to: Joi.object().keys({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    kelurahan: Joi.string(),
    kecamatan: Joi.string().required(),
    city: Joi.string().required(),
    province: Joi.string().required(),
    postcode: Joi.string(),
    zipcode: Joi.string(),
    wilayah_id: Joi.number().required(),
    email: Joi.string(),
  }),
  weight: Joi.number().required(),
  items: Joi.array().items(itemsData),
  delivery_start_date: Joi.string().required(),
  isCod: Joi.boolean().required(),
  isPickup: Joi.boolean(),
  cod_price: Joi.number(),
  pickup: Joi.object().keys({
    name: Joi.string(),
    phone: Joi.string(),
    address: Joi.string(),
    kelurahan: Joi.string(),
    kecamatan: Joi.string().required(),
    city: Joi.string().required(),
    province: Joi.string().required(),
    postcode: Joi.string(),
    date: Joi.string(),
    zipcode: Joi.string(),
    wilayah_id: Joi.number().required(),
    email: Joi.string(),
  }),
  service_level: Joi.string(),
  insured_value: Joi.number(),
  delivery_notes: Joi.string(),
});

export const TagihanSchema = Joi.object().keys({
  batch_tagihan_id: Joi.string().required(),
  batch_tagihan_upload_id: Joi.string().required(),
});

export const cancelOrder = Joi.object().keys({
  order_id: Joi.array().min(1).required(),
});

export const checkTrackingStatus = Joi.object().keys({
  awb: Joi.string(),
});
