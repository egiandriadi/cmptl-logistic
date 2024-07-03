import { RegionType } from "../../repositories/dto/param-flat-rate.dto"

export const LOCATION_TYPE: any = {
  ORIGIN: "origin",
  DESTINATION: "destination",
}
export const REGION_TYPES: RegionType[] = [
  "district",
  "city",
  "province",
];

export const REGION_TYPE_DISTRICT: RegionType = "district";
export const REGION_TYPE_CITY: RegionType = "city";
export const REGION_TYPE_PROVINCE: RegionType = "province";

export const RATE_TYPE_FLAT = "flat";
export const RATE_TYPE_PERCENT = "percent";