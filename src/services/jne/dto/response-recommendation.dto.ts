export class ResponseRecommendationDto {
    ekspedisi_name?: string;
    ekspedisi_description?: string;
    ekspedisi_code?: string;
    ekspedisi_logo?: string;
    ekspedisi_id?: number;
    layanan_ekspedisi_id?: number;
    origin_city: string;
    destination_city: string;
    services: string;
    amount: number;
    score_ekspedisi?: number;
}