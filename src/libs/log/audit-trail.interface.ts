export default interface AuditTrailInterface {

  action: string;
  module: string;
  keyId: string;
  logs?: any;
  payload: string;
  statusCode: number;

}