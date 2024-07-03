import CancelOrderResponseInterface from "../responses/cancel-order.response.interface";

export default class CancelOrderResponseDto implements CancelOrderResponseInterface{
  status: string;
  msg: string;

  constructor(data : any) {
    this.status = data.status;
    this.msg  = data.msg;
  }

  static hydrate(data : any) : CancelOrderResponseDto {
    return new CancelOrderResponseDto(data)
  }

}