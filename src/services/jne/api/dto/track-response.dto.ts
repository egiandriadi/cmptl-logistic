export default class TrackResponseDto {

  cnote : any;
  photo_history : any;
  detail : any;
  history : any;

  constructor(cnote : any, photo_history : any, detail : any, history : any) {
    this.cnote  = cnote;
    this.photo_history  = photo_history;
    this.detail   = detail;
    this.history  = history
  }

  static hydrate(cnote : any, photo_history : any, detail : any, history : any) {
    return new TrackResponseDto(cnote, photo_history, detail, history)
  }

}