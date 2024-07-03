import Joi from "joi";

export const checkTariffValidation = Joi.object({
  origin: Joi.number().required(),
  destination: Joi.number().required(),
  // weight: Joi.number().min(0.1).max(300),
  serviceType: Joi.string().required().valid("00", "03", "06"),
  weight: Joi.number().when("serviceType", {
    switch: [
      { is: "00", then: Joi.number().min(0.1).max(300) },
      { is: "03", then: Joi.number().min(0.1).max(0.5) },
      { is: "06", then: Joi.number().min(0.1).max(300) }
    ],
  }),
  isCod: Joi.boolean(),
});

export interface IItemsData {
  item_description: string;
  quantity: number;
  danger_good: boolean;
}

const itemsData = Joi.object({
  item_description: Joi.string().required(),
  quantity: Joi.number(),
  danger_good: Joi.boolean(),
});

export const createOrderValidation = Joi.object({
  order_id: Joi.string().required(),
  seller_id: Joi.string().required(),
  seller_company_name: Joi.string().required(),
  service_type: Joi.string().required().valid("00", "03", "06"),
  from: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().allow("", null),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    kelurahan: Joi.string(),
    kecamatan: Joi.string().required(),
    city: Joi.string().required(),
    province: Joi.string().required(),
    zipcode: Joi.string().required(),
    wilayah_id: Joi.number().required(),
  }),
  to: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().allow("", null),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    kelurahan: Joi.string(),
    kecamatan: Joi.string().required(),
    city: Joi.string().required(),
    province: Joi.string().required(),
    zipcode: Joi.string().required(),
    wilayah_id: Joi.number().required(),
  }),
  weight: Joi.number().when("service_type", {
    switch: [
      { is: "00", then: Joi.number().min(0.1).max(300) },
      { is: "03", then: Joi.number().min(0.1).max(0.5) },
      { is: "06", then: Joi.number().min(0.1).max(300) }
    ],
  }),
  items: Joi.array().items(itemsData),
  delivery_start_date: Joi.string().required(),
  isCod: Joi.boolean().required(),
  isPickup: Joi.boolean().required(),
  cod_price: Joi.number(),
  pickup: Joi.object().when("isPickup", {
    is: true,
    then: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().allow("", null),
      phone: Joi.string().required(),
      address: Joi.string().required(),
      kelurahan: Joi.string(),
      kecamatan: Joi.string().required(),
      city: Joi.string().required(),
      province: Joi.string().required(),
      date: Joi.string().required(),
      zipcode: Joi.string().required(),
      wilayah_id: Joi.number().required(),
    }),
  }),
  service_level: Joi.string(),
  insured_value: Joi.number(),
});

export const cancelOrderValidation = Joi.object({
  order_id: Joi.array().min(1).required(),
});

export const webhookValidation = Joi.array().items({
  clientCode: Joi.string().allow("", null),
  orderNo: Joi.string().allow("", null),
  waybillNo: Joi.string().allow("", null),
  operationType: Joi.string().allow("", null),
  lastOperationTime: Joi.alternatives().try(Joi.string(), Joi.number()).allow("", null, 0),
  courierName: Joi.string().allow("", null),
  courierPhoneNumber: Joi.string().allow("", null),
  currentBranch: Joi.string().allow("", null),
  nextBranch: Joi.string().allow("", null),
  signer: Joi.string().allow("", null),
  relation: Joi.string().allow("", null),
  problemDescription: Joi.string().allow("", null),
  proofOfStatus: Joi.string().allow("", null),
  message: Joi.string().allow("", null),
});

export const checkTrackingStatus = Joi.object().keys({
  awb: Joi.string()
})