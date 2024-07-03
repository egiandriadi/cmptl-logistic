import { region_flat_rates } from "@prisma/client";
import { LocationType } from "../../repositories/dto/param-flat-rate.dto";
import FlatRateRepository from "../../repositories/flat-rate.repository";
import { LOCATION_TYPE, RATE_TYPE_FLAT, REGION_TYPES, REGION_TYPE_CITY, REGION_TYPE_PROVINCE } from "./constants";
import { RequestFlatRateDto } from "./dto/request-flat-rate.dto";
import { ResponseFlatRateDto } from "./dto/response-flat-rate.dto";

export default class FlatRateService {
  private flatRateRepository: FlatRateRepository;
  constructor() {
    this.flatRateRepository = new FlatRateRepository();
  }

  public async getFlatRate(request: RequestFlatRateDto): Promise<null | ResponseFlatRateDto> {
    const flatRateVariations = await this.flatRateRepository.getByExpeditionCodeAndService(request.expeditionCode, request.expeditionService);

    if (flatRateVariations.length === 0) return null;

    const flatRate = await this.searchFlatRateVariation(request, flatRateVariations);

    if (flatRate === null) return null;
    const weight = request.weight ?? 1;
    const price = flatRate?.rate_type === RATE_TYPE_FLAT ? flatRate?.amount * weight
      : this.calculateDiscount(request.originalPrice, flatRate?.amount ?? 0);

    const result: ResponseFlatRateDto = {
      price: price,
      flatRate: flatRate,
    };

    return result;
  }

  private async searchFlatRateVariation(request: RequestFlatRateDto, flatRateVariations: any): Promise<any> {
    let flatRate = null;

    for (const flatRateVariation of flatRateVariations) {
      const regionFlatRates = flatRateVariation.region_flat_rates;
      const originFlatRate = await this.getRegionFlatRate(request.originRegionCode, LOCATION_TYPE.ORIGIN, regionFlatRates);
      const destinationFlatRate = await this.getRegionFlatRate(request.destinationRegionCode, LOCATION_TYPE.DESTINATION, regionFlatRates);

      if (originFlatRate && destinationFlatRate) {
        flatRate = flatRateVariation
        delete flatRate.region_flat_rates;
        break;
      }
    }

    return flatRate;
  }

  private async getRegionFlatRate(regionCode: string, locationType: LocationType, regionFlatRates: region_flat_rates[]): Promise<null | region_flat_rates> {
    let regionFlatRate = null;

    for (const regionType of REGION_TYPES) {
      if (regionType === REGION_TYPE_CITY) {
        regionCode = this.convertRegionCityCode(regionCode);
      } else if (regionType === REGION_TYPE_PROVINCE) {
        regionCode = this.convertRegionProvinceCode(regionCode);
      }

      const filterRegionFlatRate = regionFlatRates.find((regionFlatRate) => {
        return regionFlatRate.location_type == locationType
          && regionFlatRate.region_type == regionType
          && regionFlatRate.kode_wilayah == regionCode;
      });

      if (filterRegionFlatRate) {
        regionFlatRate = filterRegionFlatRate;
        break;
      };
    }

    return regionFlatRate;
  }

  private convertRegionProvinceCode(districtRegionCode: string): string {
    return districtRegionCode.substring(0, 2);
  }

  private convertRegionCityCode(districtRegionCode: string): string {
    return districtRegionCode.substring(0, 5);
  }

  private calculateDiscount(standardPrice: number, discount: number): number {
    return standardPrice - (standardPrice * (discount / 100));
  }
}