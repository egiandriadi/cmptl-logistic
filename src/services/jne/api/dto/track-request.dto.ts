import ApiCredentials from "../constants/api-credential";

export default class TrackRequestDto {

  awb : string;
  username : string;
  api_key : string;

  constructor(awb : string) {
    this.awb = awb;
    this.username = ApiCredentials.production.USERNAME;
    this.api_key  = ApiCredentials.production.API_KEY;
  }

  static hydrate(awb : string) {
    return new TrackRequestDto(awb)
  }

}