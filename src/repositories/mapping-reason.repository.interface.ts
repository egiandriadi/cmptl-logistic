export default interface MappingReasonRepositoryInterface {
  getByEkspedisiCode(ekspedisiCode: string): Promise<any>;
}