import * as dotenv from "dotenv";
import * as Confidence from "confidence";
dotenv.config();

const store = new Confidence.Store();

const config = {
  port: process.env.PORT || 3000,
  database: {
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    dbname: process.env.DB_NAME,
  },
  ninja: {
    client_id: process.env.NINJA_CLIENT_ID,
    client_secret: process.env.NINJA_CLIENT_SECRET,
    type: process.env.NINJA_ENV,
  },
  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    accessKeySecret: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
  },
  idexpress: {
    app_id: process.env.IDX_APP_ID ?? "",
    secret_key: process.env.IDX_SECRET_KEY ?? "",
    base_url: process.env.IDX_BASE_URL ?? "",
    production: {
      app_id: process.env.IDX_PROD_APP_ID ?? process.env.IDX_APP_ID ?? "",
      secret_key:
        process.env.IDX_PROD_SECRET_KEY ?? process.env.IDX_SECRET_KEY ?? "",
      base_url: process.env.IDX_PROD_BASE_URL ?? process.env.IDX_BASE_URL ?? "",
    },
  },
  sap: {
    api_endpoint: process.env.SAP_API_ENDPOINT ?? "",
    warehouse_endpoint: process.env.SAP_WAREHOUSE_API_ENDPOINT ?? "",
    courier_api_key: process.env.SAP_COURIER_API_KEY ?? "",
    warehouse_api_key: process.env.SAP_WAREHOUSE_API_KEY ?? "",
    cod_account: process.env.SAP_COD_ACCOUNT ?? "",
    non_cod_account: process.env.SAP_NON_COD_ACCOUNT ?? "",
    default_email: process.env.SAP_DEFAULT_EMAIL ?? "",
    production: {
      api_endpoint:
        process.env.SAP_PROD_API_ENDPOINT ?? process.env.SAP_API_ENDPOINT ?? "",
      warehouse_endpoint:
        process.env.SAP_PROD_WAREHOUSE_API_ENDPOINT ??
        process.env.SAP_WAREHOUSE_API_ENDPOINT ??
        "",
      courier_api_key:
        process.env.SAP_PROD_COURIER_API_KEY ??
        process.env.SAP_COURIER_API_KEY ??
        "",
      warehouse_api_key:
        process.env.SAP_PROD_WAREHOUSE_API_KEY ??
        process.env.SAP_WAREHOUSE_API_KEY ??
        "",
      cod_account:
        process.env.SAP_PROD_COD_ACCOUNT ?? process.env.SAP_COD_ACCOUNT ?? "",
      non_cod_account:
        process.env.SAP_PROD_NON_COD_ACCOUNT ??
        process.env.SAP_NON_COD_ACCOUNT ??
        "",
      default_email:
        process.env.SAP_PROD_DEFAULT_EMAIL ??
        process.env.SAP_DEFAULT_EMAIL ??
        "",
    },
  },
  jne: {
    username: process.env.JNE_USERNAME ?? "",
    api_key: process.env.JNE_API_KEY ?? "",
    base_url: process.env.JNE_BASE_URL ?? "",
    cust_id: process.env.JNE_CUST_ID ?? "",
    cod_cust_id: process.env.JNE_COD_CUST_ID ?? "",
    production: {
      username: process.env.JNE_PROD_USERNAME ?? process.env.JNE_USERNAME ?? "",
      api_key: process.env.JNE_PROD_API_KEY ?? process.env.JNE_API_KEY ?? "",
      base_url: process.env.JNE_PROD_BASE_URL ?? process.env.JNE_BASE_URL ?? "",
      cust_id: process.env.JNE_PROD_CUST_ID ?? process.env.JNE_CUST_ID ?? "",
      cod_cust_id:
        process.env.JNE_PROD_COD_CUST_ID ?? process.env.JNE_COD_CUST_ID ?? "",
    },
  },
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_READER_URL: process.env.DATABASE_READER_URL,
};

export const get = (key: string) => store.get(key);
store.load(config);

export default config;
