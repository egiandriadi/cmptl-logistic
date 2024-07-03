import AuditTrailInterface from "./audit-trail.interface";

export default class AuditTrail implements AuditTrailInterface {
  action: string;
  module: string;
  keyId: string;
  logs?: any;
  payload: string;
  statusCode: number;
}