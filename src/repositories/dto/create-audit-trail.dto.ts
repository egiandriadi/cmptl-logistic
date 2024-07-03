const MODULE_TITLE = "microservices-ekspedisi";

export class CreateAuditTrailDto {
  action: string;
  module: string;
  key_id: string;
  logs: string | null;
  payload: string;
  status_code: number;

  static hydrate(
    action: string,
    keyId: string,
    payload: string,
    statusCode: number,
    logs: string | null = null
  ) {
    let obj = new CreateAuditTrailDto();
    obj.action = action;
    obj.key_id = keyId;
    obj.payload = payload;
    obj.status_code = statusCode;
    obj.logs = logs;
    obj.module = MODULE_TITLE;
    return obj;
  }
}
