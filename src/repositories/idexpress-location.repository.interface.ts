export default interface IdexpressLocationRepositoryInterface {
  getByZipCode(zipCode: string): Promise<any>;
  getByZipCodeAndCod(zipCode: string, isCod: boolean): Promise<any>;
  getByRegionId(regionId: number): Promise<any>;
  getByRegionIdAndCodStandard(regionId: number, isCod: boolean): Promise<any>;
  getByRegionIdAndCodLite(regionId: number, isCod: boolean): Promise<any>;
  getByRegionIdAndCodCargo(regionId: number, isCod: boolean): Promise<any>;
}