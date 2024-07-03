export type StatusOrderLog = {
  airwaybill_number: string;
  created_at: string;
  status: string;
  images?: string[];
  signature?: string;
  signed_by?: SignedBy;
  failure_reason?: string;
  hub_information?: HubInformation;
}

export type SignedBy = {
  name: string;
  contact?: string;
  relationship: string;
}

export type HubInformation = {
  country: string;
  city?: string;
  hub: string;
}