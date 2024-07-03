import { CreateAuditTrailDto } from "./dto/create-audit-trail.dto";
import { UpdateLogsAuditTrailDto } from "./dto/update-logs-audit-trail.dto";

export default interface AuditTrailRepositoryInterface {
  create(createAuditTrailDto: CreateAuditTrailDto): Promise<any>;
  updateLogsById(id: number, updateLogsAuditTrailDto: UpdateLogsAuditTrailDto): Promise<any>;
}
