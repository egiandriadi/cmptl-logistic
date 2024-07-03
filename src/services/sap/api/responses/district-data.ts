import DistrictDataInterface from "./district-data.interface";

export default class DistrictData implements DistrictDataInterface {
  city_code: String;
  district_code: String;
  district_name: String;
  zone_code: String;
  provinsi_code: String;
  city_name: String;
  tlc_branch_code: String;
  provinsi_name: String;
}