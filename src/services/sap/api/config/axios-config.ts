import config from "../../../../config/global.config"

const courierAxiosConfig = {
  headers : {
    "api_key" : config.sap.courier_api_key,
    "Content-Type" : "application/json"
  }
}

const courierProductionAxiosConfig  = {
  headers : {
    "api_key" : config.sap.production.courier_api_key,
    "Content-Type" : "application/json"
  }
}

const warehouseAxiosConfig = {
  headers : {
    "api_key" : config.sap.warehouse_api_key,
    "Content-Type" : "application/json"
  }
}

const warehouseProductionAxiosConfig  = {
  headers : {
    "api_key" : config.sap.production.courier_api_key,
    "Content-Type" : "application/json"
  }
}

export {
  courierAxiosConfig,
  courierProductionAxiosConfig,
  warehouseAxiosConfig,
  warehouseProductionAxiosConfig
};