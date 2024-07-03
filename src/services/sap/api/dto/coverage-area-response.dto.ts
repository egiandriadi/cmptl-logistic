import CoverageAreaResponseInterface from "../responses/coverage-area.response.interface";
import DistrictData from "../responses/district-data";
import _ from "lodash";

export default class CoverageAreaResponseDto implements CoverageAreaResponseInterface {

  status: String;
  msg: String;
  data: DistrictData[];
  
  constructor(res : any) {
    this.status = res.status;
    this.msg = res.msg;
    this.data = this.mapDistrictData(res.data);  
  }

  static hydrate(res : any) : CoverageAreaResponseInterface {
    return new CoverageAreaResponseDto(res)
  }

  protected mapDistrictData = (res : CoverageAreaResponseInterface) => {
    return _.map(res.data, (data) => {
      const obj = new DistrictData;
      obj.city_code = data.city_code;
      obj.city_name = data.city_name;
      obj.district_code  = data.district_code;
      obj.district_name  = data.district_name;
      obj.zone_code = data.zone_code;
      obj.provinsi_code  = data.provinsi_code;
      obj.provinsi_name  = data.provinsi_name;
      obj.tlc_branch_code  = data.tlc_branch_code;
      return obj;
    });
  }
    
}
