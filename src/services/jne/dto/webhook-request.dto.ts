import moment from "moment";
import WebhookRequestInterface from "../../../libs/webhook/webhook-request.interface";

export default class WebhookRequestDto implements WebhookRequestInterface {
  
  static EXPEDITION_CODE = "jne";

  awb: string;
  expedition_code: string;
  status: string;
  timestamp: string;
  payload: any;

  constructor(awb : string, status : string, timestamp : string, payload : any) {
    this.awb = awb;
    this.expedition_code = WebhookRequestDto.EXPEDITION_CODE;
    this.status = status;
    this.timestamp = timestamp;
    this.payload = payload
  }

  static hydrate(payload : any) {
    const { awb, status, history } = payload;
    const lastHistory = history.pop();
    const timestamp = moment(lastHistory.date).format("YYYY-MM-DD HH:mm:ss");

    return new WebhookRequestDto(awb, status, timestamp, payload);
  }
  
}