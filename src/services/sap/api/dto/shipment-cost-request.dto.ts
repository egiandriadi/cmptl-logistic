import ShipmentCostRequestInterface from "../requests/shipment-cost.request.interface";

export default class ShipmentCostRequestDto implements ShipmentCostRequestInterface {

  origin: String;
  destination: String;
  weight: String;
  customer_code: String;
  packing_type_code?: String | undefined;
  volumetric?: String | undefined;
  insurance_type_code?: String | undefined;
  item_value?: String | undefined;

  constructor(
    origin: string, 
    destination: string, 
    weight: string, 
    customer_code: string, 
    packing_type_code: any = null, 
    volumetric: any = null,
    insurance_type_code: any = null,
    item_value: any = null
  ) {

    this.origin = origin;
    this.destination = destination;
    this.weight = weight;
    this.customer_code = customer_code;
    
    if (packing_type_code) this.packing_type_code = packing_type_code;
    if (volumetric) this.volumetric = volumetric;
    if (insurance_type_code) this.insurance_type_code = insurance_type_code;
    if (item_value) this.item_value = item_value;
  }

  static hydrate(    
    origin: string, 
    destination: string, 
    weight: string, 
    customer_code: string, 
    packing_type_code: any = null, 
    volumetric: any = null,
    insurance_type_code: any = null,
    item_value: any = null
  ) : ShipmentCostRequestInterface {
    return new ShipmentCostRequestDto(
      origin, 
      destination, 
      weight, 
      customer_code, 
      packing_type_code, 
      volumetric,
      insurance_type_code,
      item_value
    )
  }

}
