import { CreateFailureReasonDto } from "./dto/create-failure-reason.dto";

export default interface FailureReasonRepositoryInterface {
  create(data: CreateFailureReasonDto): Promise<any>;
}