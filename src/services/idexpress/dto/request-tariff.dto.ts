export class RequestTariffDto {
  origin: number;
  destination: number;
  serviceType: string;
  weight: number;
  isCod: boolean;
}

enum ServiceType {
  "00" = "00",
  "01" = "01",
  "06" = "06",
}
