import config from "../../../../config/global.config";

const ApiCredentials = {
  USERNAME : config.jne.username,
  API_KEY : config.jne.api_key,
  CUST_ID : config.jne.cust_id,
  COD_CUST_ID : config.jne.cod_cust_id,
  production : {
    USERNAME : config.jne.production.username,
    API_KEY : config.jne.production.api_key,
    CUST_ID : config.jne.production.cust_id,
    COD_CUST_ID : config.jne.production.cod_cust_id,
  }
}

export default ApiCredentials;
