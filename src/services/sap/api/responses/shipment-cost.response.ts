import ShipmentCostData from "./shipment-cost-data";
import ShipmentCostResponseInterface from "./shipment-cost.response.interface";

export default class ShipmentCostResponse implements ShipmentCostResponseInterface {
  status: String;
  data: ShipmentCostData;

  constructor(response : any) {
    const { status, data } = response.data;
    this.status = status;
    this.data = data;
  }
  
}