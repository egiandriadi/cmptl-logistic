export class PayloadCheckTariffDto {
    senderCityId: number | null;
    recipientDistrictId: number | null;
    weight: number;
    expressType: string;
}