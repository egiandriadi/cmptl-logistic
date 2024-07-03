import OrderDataDto from "../dto/order-data.dto";
import ShipmentCostRequestDto from "./dto/shipment-cost-request.dto";
import DistrictDataInterface from "./responses/district-data.interface";
import ServiceCostInterface from "./responses/service-cost.interface";
import OrderDataInterface from "./requests/order/order-data.interface";
import TrackOrderRequestInterface from "./requests/track-order.request.interface";

export default interface SapApiServiceInterface {

  getCoverageArea() : Promise<DistrictDataInterface[]>

  getShipmentCost(shipmentCostRequestDto : any) : Promise<any>

  createOrder(orderData : any) : Promise<any>

  cancelOrder(orderData : any) : Promise<any>

  track(awbData : TrackOrderRequestInterface) : Promise<any>

}