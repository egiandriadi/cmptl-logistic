export class RequestWebhookDto {
  awb: string;
  expedition_code: string;
  status: string;
  timestamp: string; // format YYYY-MM-DD HH:mm:ss
  payload: any;
}
