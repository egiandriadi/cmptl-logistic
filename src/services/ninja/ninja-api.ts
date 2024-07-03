import config from "../../config/global.config";

export const BASE_URL  = config.ninja.type == "sandbox" || config.ninja.type == "development" ?
 "https://api-sandbox.ninjavan.co/id/" : "https://api.ninjavan.co/id/";

export const TRACK_URL = `${BASE_URL}1.0/orders/tracking-events/`;