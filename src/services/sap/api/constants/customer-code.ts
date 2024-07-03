import config from "../../../../config/global.config";

const CustomerCode = {
  COD_ACCOUNT : config.sap.cod_account,
  NON_COD_ACCOUNT : config.sap.non_cod_account,
  PROD_COD_ACCOUNT : config.sap.production.cod_account,
  PROD_NON_COD_ACCOUNT : config.sap.production.non_cod_account
}

export default CustomerCode;