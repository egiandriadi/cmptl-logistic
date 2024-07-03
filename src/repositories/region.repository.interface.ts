export default interface RegionRepositoryInterface {
  getByName(city: string, district: string): Promise<any>;
  getById(id: number): Promise<any>;
}
