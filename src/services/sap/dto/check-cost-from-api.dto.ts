export default class CheckCostFromApiDto {

  origin_district_code: string;
  destination_district_code: string;
  service_type: string; 
  weight: string;
  isCod: boolean;
  destination_cod_coverage: boolean

  constructor(
    origin_district_code : string,
    destination_district_code : string,
    service_type : string,
    weight : string,
    isCod : boolean,
    destination_cod_coverage : boolean
  ) {
    this.origin_district_code = origin_district_code;
    this.destination_district_code = destination_district_code;
    this.service_type  = service_type;
    this.weight  = weight;
    this.isCod  = isCod;
    this.destination_cod_coverage = destination_cod_coverage;
  }

  static hydrate(
    origin_district_code : string,
    destination_district_code : string,
    service_type : string,
    weight : string,
    isCod : boolean,
    destination_cod_coverage : boolean
  ) {
    return new CheckCostFromApiDto(origin_district_code, destination_district_code, service_type, weight, isCod, destination_cod_coverage);
  }

}