export default class CostDataDto {
  
  origin_city : string;
  destination_city : string;
  services: string;
  amount: number;

  constructor(
    origin_city : string,
    destination_city : string,
    services: string,
    amount: number,  
  ) {
    this.origin_city  = origin_city;
    this.destination_city = destination_city;
    this.services = services;
    this.amount = amount;  
  }

  static hydrate(
    origin_city : string,
    destination_city : string,
    services: string,
    amount: number
  ) {
    return new CostDataDto(
      origin_city,
      destination_city,
      services,
      amount
    );
  }

}
