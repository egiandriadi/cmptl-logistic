import ApiCredentials from "../constants/api-credential";

export default class CancelOrderRequestDto {
  username: string;
  api_key: string;
  cnote_no: string;
  pic_cancel: string;
  reason_cancel: string;

  constructor(
    cnote_no: string,
    pic_cancel: string,
    reason_cancel: string = "Customer tidak jadi mengirim barang",
  ) {
    this.username = ApiCredentials.USERNAME;
    this.api_key = ApiCredentials.API_KEY;
    this.cnote_no = cnote_no;
    this.pic_cancel = pic_cancel;
    this.reason_cancel = reason_cancel;
  }
}
