import ApiCredentials from "../constants/api-credential";

export default class CheckTariffRequestDto {
	username: string;
	api_key: string;
	from: string;
	thru: string;
	weight: number;

  constructor(
    from: string,
    thru: string,
    weight: number,
  ) {
    this.username = ApiCredentials.production.USERNAME;
    this.api_key = ApiCredentials.production.API_KEY;
    this.from = from;
    this.thru = thru;
    this.weight = weight;
  }
}