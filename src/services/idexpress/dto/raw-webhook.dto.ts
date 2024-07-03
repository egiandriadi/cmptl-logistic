export default class RawWebhookDto {
  clientCode : string;
  orderNo : string;
  waybillNo : string;
  operationType : string;
  lastOperationTime : number;
  courierName : string;
  courierPhoneNumber : string;
  currentBranch : string;
  nextBranch : string;
  signer: string;
  relation: string;
  problemDescription: string;
  proofOfStatus: string;
  message: string;
}