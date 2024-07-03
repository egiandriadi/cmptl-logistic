export default interface OrderHistoryRepositoryInterface {
  countOrderScoring(expeditionCode: string, zipcode: string, status: string): Promise<any>;
}