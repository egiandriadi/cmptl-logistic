export default class CancelOrderResponseDto {
  status: boolean;
  reason: string;

  constructor(data: any) {
    this.status = data.status;
    this.reason = data.reason;
  }
}