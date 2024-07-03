import { AxiosResponse } from "axios";
import CreateOrderResponse from "../responses/create-order.response";
import CreateOrderResponseInterface from "../responses/create-order.response.interface"
import CreatedOrderData from "../responses/created-order-data";
import CreatedOrderDataInterface from "../responses/created-order-data.interface";

export default class CreatedOrderResponseDto implements CreatedOrderDataInterface {

  awb_no: string;
  reference_no: string;
  origin_branch_code: string;
  destination_branch_code: string;
  tlc_branch_code: string;
  label: string;

  constructor(res : AxiosResponse) {

    let obj : CreateOrderResponseInterface = new CreateOrderResponse(res.data);
    const { awb_no, reference_no, origin_branch_code, destination_branch_code, tlc_branch_code, label } = obj.data;

    this.awb_no = awb_no;
    this.reference_no  = reference_no;
    this.origin_branch_code  = origin_branch_code;
    this.destination_branch_code = destination_branch_code;
    this.tlc_branch_code = tlc_branch_code;
    this.label = label;

  }

  static hydrate(res : AxiosResponse) : CreatedOrderDataInterface {
    return new CreatedOrderResponseDto(res);
  }
  
}

