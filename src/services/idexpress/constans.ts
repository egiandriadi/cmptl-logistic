import config from "../../config/global.config";

export const PAYLOAD_PICKUP_CODE = "00";
export const PAYLOAD_DROP_OFF_CODE = "01";
export const PAYLOAD_CATEGORY_ITEMS = "00";
export const PAYLOAD_PAYMENT_TYPE_PERIODIC = "01";
export const AUDIT_TRAIL_ACTION_GENERATE = "Generate Resi Idexpress";
export const AUDIT_TRAIL_ACTION_CANCEL = "Cancel Order Idexpress";
export const AUDIT_TRAIL_MODULE = "microservices-ekspedisi";

export const URL_GET_TARIFF = `${config.idexpress.production.base_url}open/v1/waybill/get-standard-fee`;
export const URL_CREATE_ORDER = `${config.idexpress.base_url}open/v1/waybill/create`;
export const URL_CANCEL_ORDER = `${config.idexpress.base_url}open/v1/waybill/cancel`;
export const URL_TRACK_STATUS = `${config.idexpress.production.base_url}open/v1/waybill/get-tracking`;

export const STATUS_CANCELED = "Cancel Order";

export const EXPEDITION_IDEXPRESS_CODE = "idexpress";

export const IDEXPRESS_TYPE_STANDARD = "00";
export const IDEXPRESS_TYPE_LITE = "03";
export const IDEXPRESS_TYPE_CARGO = "06";

export const IDEXPRESS_API_STATUS_OK = 0;
export const IDEXPRESS_API_DATA_DUPLICATE = -1;

export const IDEXPRESS_API_TIMEOUT = 300000; // in millisecond