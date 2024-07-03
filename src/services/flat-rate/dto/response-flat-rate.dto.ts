import { m_flat_rates } from "@prisma/client";

export type ResponseFlatRateDto = {
  price: number;
  flatRate: m_flat_rates | null;
}