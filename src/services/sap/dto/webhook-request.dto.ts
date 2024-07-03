import WebhookRequestInterface from "../../../libs/webhook/webhook-request.interface";

export default class WebhookRequestDto implements WebhookRequestInterface {
  
  static EXPEDITION_CODE = "sap";

  payload : any;
  status: string;
  awb : string;
  timestamp: string;
  expedition_code: string;

  constructor(awb : string, status : string, payload : any) {
    this.awb  = awb;
    this.expedition_code = WebhookRequestDto.EXPEDITION_CODE;
    this.status = status;
    this.timestamp = payload.created_at;
    this.payload = payload;
  }

  static hydrate(reqBody : any) : WebhookRequestInterface {
    const { awb_no, rowstate_name } = reqBody;
    return new WebhookRequestDto(awb_no, rowstate_name, reqBody);
  }
  
}