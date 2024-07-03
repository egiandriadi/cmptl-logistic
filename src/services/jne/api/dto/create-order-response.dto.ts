import _ from "lodash";

const MapCustomerRef = (custRef : any) : CustomerRef[] => {
  return _.map(custRef, (p) => {
    const obj = new CustomerRef;
      obj.status  = p.status;
      obj.cnote_no  = p.cnote_no;
      obj.reason = p.reason ? p.reason : "Order Successfully Created";
      return obj;
    })
}

class CustomerRef {
  status: string;
  cnote_no: string;
  reason: string;
}

export default class CreateOrderResponseDto {
  detail: CustomerRef[];

  constructor(data : any) {
    this.detail = MapCustomerRef(data.detail);
  }

  getCustomerRef() : CustomerRef {
    return this.detail[0];
  }
}