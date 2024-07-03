export class UpdateLogsAuditTrailDto {
  logs: string;
  status_code: number;

  static hydrate(logs : string, statusCode : number) {
    let obj = new UpdateLogsAuditTrailDto;
    obj.logs = logs;
    obj.status_code = statusCode;
    return obj;
  }
}
