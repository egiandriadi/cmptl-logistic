export default class TrackHistoryDto {
  courierName: string;
  currentBranch: string;
  description: string;
  nextBranchName: string;
  operationTime: number;
  operationType: string;
  problemCode: string;
  proofOfStatus: string;
  relation: string;
  signer: string;
  waybillNo: string;

  static hydrate(history: any) {
    let obj = new TrackHistoryDto;
    obj = history;
    return obj;
  }
}