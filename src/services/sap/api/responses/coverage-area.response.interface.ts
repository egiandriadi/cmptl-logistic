import DistrictData from "./district-data";

export default interface CoverageAreaResponseInterface {
  status: String;
  msg : String;
  data: DistrictData[]
}