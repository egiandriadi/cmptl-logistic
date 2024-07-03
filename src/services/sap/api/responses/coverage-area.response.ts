import CoverageAreaResponseInterface from "./coverage-area.response.interface";
import DistrictData from "./district-data";

export default class CoverageAreaResponse implements CoverageAreaResponseInterface {
  status: String;
  msg : String;
  data: DistrictData[];
}