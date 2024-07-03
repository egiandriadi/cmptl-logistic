import { m_flat_rates } from "prisma/prisma-client";

export class ResponseTariffDto {
  origin_city: string;
  destination_city: string;
  services: string;
  amount: number;
  original_amount?: number;
  flat_rate?: m_flat_rates | null;
}