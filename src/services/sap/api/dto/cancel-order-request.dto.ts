import CancelOrderRequestInterface from "../requests/cancel-order.request.interface";

export default class CancelOrderRequestDto implements CancelOrderRequestInterface {

  awb_no: string;
  desc: string;

  constructor(
    awb_no  : string,
    desc    : string = "Pengirim tidak jadi mengirim barang"
  ) {
    this.awb_no = awb_no;
    this.desc = desc;
  }

  static hydrate(awb_no : string) : CancelOrderRequestInterface {
    return new CancelOrderRequestDto(awb_no)
  }

}
