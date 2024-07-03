export class CreateIdexpressRatecardDto {
  uuid: string;
  origin_city_id: number;
  origin_city_name: string;
  destination_district_id: number;
  destination_district_name: string;
  services: string;
  amount: number;
  created_by: string;
}
