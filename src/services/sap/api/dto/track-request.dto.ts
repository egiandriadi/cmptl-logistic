import TrackOrderRequestInterface from "../requests/track-order.request.interface";

export default class TrackRequestDto implements TrackOrderRequestInterface {

  awb_no : string;

  constructor(awb : string) {
    this.awb_no = awb;
  }

  static hydrate(awb : string) {
    return new TrackRequestDto(awb)
  }

}