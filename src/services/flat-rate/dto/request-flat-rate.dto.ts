export type RequestFlatRateDto = {
    expeditionCode: string;
    expeditionService: string;
    originRegionCode: string;
    destinationRegionCode: string;
    originalPrice: number;
    weight?: number;
}