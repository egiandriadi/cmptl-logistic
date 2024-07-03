import newlineCleanerHelper from "../../../../helpers/newline-cleaner.helper";
import ApiCredentials from "../constants/api-credential";

export default class CreatedOrderRequestDto {
  username: string;
  api_key: string;
  CUST_ID: string;
  BRANCH: string;
  ORDER_ID: string;
  ORIGIN_CODE: string;
  DESTINATION_CODE: string;
  SERVICE_CODE: string;
  WEIGHT: number;
  QTY: number;
  GOODS_DESC: string;
  GOODS_AMOUNT: number;
  INSURANCE_FLAG: string;
  SPECIAL_INS: string;
  MERCHANT_ID: string;
  TYPE: string;
  AWB?: string; // optional
  // Pick-up Data
  PICKUP_NAME: string;
  PICKUP_DATE: string; // DD-MM-YYYY
  PICKUP_TIME: string; // H24:MM
  PICKUP_PIC: string;
  PICKUP_PIC_PHONE: string;
  PICKUP_ADDRESS: string;
  PICKUP_DISTRICT: string;
  PICKUP_CITY: string;
  PICKUP_SERVICE: string;
  PICKUP_VEHICLE: string;
  // Shipper Data
  SHIPPER_NAME: string;
  SHIPPER_ADDR1: string;
  SHIPPER_ADDR2: string;
  SHIPPER_CITY: string;
  SHIPPER_ZIP: string;
  SHIPPER_REGION: string;
  SHIPPER_CONTACT: string;
  SHIPPER_PHONE: string;
  SHIPPER_ADDR3?: string | undefined; // optional
  SHIPPER_COUNTRY?: string | undefined; // optional
  // Receiver Data
  RECEIVER_NAME: string;
  RECEIVER_ADDR1: string;
  RECEIVER_ADDR2: string;
  RECEIVER_CITY: string;
  RECEIVER_ZIP: string;
  RECEIVER_REGION: string;
  RECEIVER_CONTACT: string;
  RECEIVER_PHONE: string;
  RECEIVER_ADDR3?: string | undefined; // optional
  RECEIVER_COUNTRY?: string | undefined; // optional
  // Other Data (Optionals)
  LAT?: string | undefined;
  LON?: string | undefined;
  COD_FLAG?: string | undefined;
  COD_AMOUNT?: number | undefined;
  TAX_VALUE?: number | undefined;
  ITEM_TYPE?: string | undefined; // khusus kiriman batam
  HS_CODE?: string | undefined; // khusus kiriman batam
  NPWP?: string | undefined; // khusus kiriman batam
  RETURN_NAME?: string | undefined;
  RETURN_ADDR1?: string | undefined;
  RETURN_ADDR2?: string | undefined;
  RETURN_ADDR3?: string | undefined;
  RETURN_CITY?: string | undefined;
  RETURN_ZIP?: string | undefined;
  RETURN_REGION?: string | undefined;
  RETURN_COUNTRY?: string | undefined;
  RETURN_CONTACT?: string | undefined;
  RETURN_PHONE?: string | undefined;
  RETURN_BRANCH?: string | undefined;

  constructor(
    BRANCH: string,
    ORDER_ID: string,
    ORIGIN_CODE: string,
    DESTINATION_CODE: string,
    SERVICE_CODE: string,
    WEIGHT: number,
    QTY: number,
    GOODS_DESC: string,
    GOODS_AMOUNT: number,
    INSURANCE_FLAG: string,
    SPECIAL_INS: string,
    MERCHANT_ID: string,
    TYPE: string,
    AWB: string | undefined,
    PICKUP_NAME: string,
    PICKUP_DATE: string,
    PICKUP_TIME: string,
    PICKUP_PIC: string,
    PICKUP_PIC_PHONE: string,
    PICKUP_ADDRESS: string,
    PICKUP_DISTRICT: string,
    PICKUP_CITY: string,
    PICKUP_SERVICE: string,
    PICKUP_VEHICLE: string,
    SHIPPER_NAME: string,
    SHIPPER_ADDR1: string,
    SHIPPER_ADDR2: string,
    SHIPPER_CITY: string,
    SHIPPER_ZIP: string,
    SHIPPER_REGION: string,
    SHIPPER_CONTACT: string,
    SHIPPER_PHONE: string,
    SHIPPER_ADDR3: string | undefined,
    SHIPPER_COUNTRY: string | undefined,
    RECEIVER_NAME: string,
    RECEIVER_ADDR1: string,
    RECEIVER_ADDR2: string,
    RECEIVER_CITY: string,
    RECEIVER_ZIP: string,
    RECEIVER_REGION: string,
    RECEIVER_CONTACT: string,
    RECEIVER_PHONE: string,
    RECEIVER_ADDR3: string | undefined,
    RECEIVER_COUNTRY: string | undefined,
    LAT: string | undefined,
    LON: string | undefined,
    COD_FLAG: string | undefined,
    COD_AMOUNT: number | undefined,
    TAX_VALUE: number | undefined,
    ITEM_TYPE: string | undefined,
    HS_CODE: string | undefined,
    NPWP: string | undefined,
    RETURN_NAME: string | undefined,
    RETURN_ADDR1: string | undefined,
    RETURN_ADDR2: string | undefined,
    RETURN_ADDR3: string | undefined,
    RETURN_CITY: string | undefined,
    RETURN_ZIP: string | undefined,
    RETURN_REGION: string | undefined,
    RETURN_COUNTRY: string | undefined,
    RETURN_CONTACT: string | undefined,
    RETURN_PHONE: string | undefined,
    RETURN_BRANCH: string | undefined,
  ) {
    this.username = ApiCredentials.USERNAME;
    this.api_key = ApiCredentials.API_KEY;
    this.CUST_ID = ApiCredentials.CUST_ID;
    if (COD_FLAG === "YES") this.CUST_ID = ApiCredentials.COD_CUST_ID;
    this.BRANCH = BRANCH;
    this.ORDER_ID = ORDER_ID;
    this.ORIGIN_CODE = ORIGIN_CODE;
    this.DESTINATION_CODE = DESTINATION_CODE;
    this.SERVICE_CODE = SERVICE_CODE;
    this.WEIGHT = WEIGHT;
    this.QTY = QTY;
    this.GOODS_DESC = newlineCleanerHelper(GOODS_DESC.substring(0, 60));
    this.GOODS_AMOUNT = GOODS_AMOUNT;
    this.INSURANCE_FLAG = INSURANCE_FLAG;
    this.SPECIAL_INS = SPECIAL_INS;
    this.MERCHANT_ID = MERCHANT_ID;
    this.TYPE = TYPE;
    if(AWB) this.AWB = AWB;
    this.PICKUP_NAME = newlineCleanerHelper(PICKUP_NAME.substring(0, 50));
    this.PICKUP_DATE = PICKUP_DATE;
    this.PICKUP_TIME = PICKUP_TIME;
    this.PICKUP_PIC = newlineCleanerHelper(PICKUP_PIC.substring(0, 30));
    this.PICKUP_PIC_PHONE = newlineCleanerHelper(PICKUP_PIC_PHONE.substring(0, 30));
    this.PICKUP_ADDRESS = newlineCleanerHelper(PICKUP_ADDRESS.substring(0, 300));
    this.PICKUP_DISTRICT = newlineCleanerHelper(PICKUP_DISTRICT.substring(0, 30));
    this.PICKUP_CITY = newlineCleanerHelper(PICKUP_CITY.substring(0, 30));
    this.PICKUP_SERVICE = PICKUP_SERVICE;
    this.PICKUP_VEHICLE = PICKUP_VEHICLE;
    this.SHIPPER_NAME = newlineCleanerHelper(SHIPPER_NAME.substring(0, 30));
    this.SHIPPER_ADDR1 = newlineCleanerHelper(SHIPPER_ADDR1.substring(0, 85));
    this.SHIPPER_ADDR2 = newlineCleanerHelper(SHIPPER_ADDR2.substring(0, 85));
    this.SHIPPER_CITY = newlineCleanerHelper(SHIPPER_CITY.substring(0, 20));
    this.SHIPPER_ZIP = SHIPPER_ZIP;
    this.SHIPPER_REGION = newlineCleanerHelper(SHIPPER_REGION.substring(0, 20));
    this.SHIPPER_CONTACT = newlineCleanerHelper(SHIPPER_CONTACT.substring(0, 20));
    this.SHIPPER_PHONE = newlineCleanerHelper(SHIPPER_PHONE.substring(0, 50));
    if (SHIPPER_ADDR3) this.SHIPPER_ADDR3 = newlineCleanerHelper(SHIPPER_ADDR3.substring(0, 85));
    if (SHIPPER_COUNTRY) this.SHIPPER_COUNTRY = newlineCleanerHelper(SHIPPER_COUNTRY.substring(0, 20));
    this.RECEIVER_NAME = newlineCleanerHelper(RECEIVER_NAME.substring(0, 30));
    this.RECEIVER_ADDR1 = newlineCleanerHelper(RECEIVER_ADDR1.substring(0, 85));
    this.RECEIVER_ADDR2 = newlineCleanerHelper(RECEIVER_ADDR2.substring(0, 85));
    this.RECEIVER_CITY = newlineCleanerHelper(RECEIVER_CITY.substring(0, 20));
    this.RECEIVER_ZIP = RECEIVER_ZIP;
    this.RECEIVER_REGION = newlineCleanerHelper(RECEIVER_REGION.substring(0, 20));
    this.RECEIVER_CONTACT = newlineCleanerHelper(RECEIVER_CONTACT.substring(0, 20));
    this.RECEIVER_PHONE = newlineCleanerHelper(RECEIVER_PHONE.substring(0, 50));
    if (RECEIVER_ADDR3) this.RECEIVER_ADDR3 = newlineCleanerHelper(RECEIVER_ADDR3.substring(0, 85));
    if (RECEIVER_COUNTRY) this.RECEIVER_COUNTRY = newlineCleanerHelper(RECEIVER_COUNTRY.substring(0, 20));
    if (LAT) this.LAT = LAT;
    if (LON) this.LON = LON;
    if (COD_FLAG) this.COD_FLAG = COD_FLAG;
    if (COD_AMOUNT) this.COD_AMOUNT = COD_AMOUNT;
    if (TAX_VALUE) this.TAX_VALUE = TAX_VALUE;
    if (ITEM_TYPE) this.ITEM_TYPE = ITEM_TYPE;
    if (HS_CODE) this.HS_CODE = HS_CODE;
    if (NPWP) this.NPWP = NPWP;
    if (RETURN_NAME) this.RETURN_NAME = newlineCleanerHelper(RETURN_NAME.substring(0, 30));
    if (RETURN_ADDR1) this.RETURN_ADDR1 = newlineCleanerHelper(RETURN_ADDR1.substring(0, 30));
    if (RETURN_ADDR2) this.RETURN_ADDR2 = newlineCleanerHelper(RETURN_ADDR2.substring(0, 30));
    if (RETURN_ADDR3) this.RETURN_ADDR3 = newlineCleanerHelper(RETURN_ADDR3.substring(0, 30));
    if (RETURN_CITY) this.RETURN_CITY = newlineCleanerHelper(RETURN_CITY.substring(0, 20));
    if (RETURN_ZIP) this.RETURN_ZIP = RETURN_ZIP;
    if (RETURN_REGION) this.RETURN_REGION = newlineCleanerHelper(RETURN_REGION.substring(0, 20));
    if (RETURN_COUNTRY) this.RETURN_COUNTRY = newlineCleanerHelper(RETURN_COUNTRY.substring(0, 20));
    if (RETURN_CONTACT) this.RETURN_CONTACT = newlineCleanerHelper(RETURN_CONTACT.substring(0, 20));
    if (RETURN_PHONE) this.RETURN_PHONE = newlineCleanerHelper(RETURN_PHONE.substring(0, 15));
    if (RETURN_BRANCH) this.RETURN_BRANCH = RETURN_BRANCH;
  }
}
