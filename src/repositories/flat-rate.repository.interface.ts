export default interface FlatRateRepositoryInterface {
  getByExpeditionCodeAndService(expeditionCode: string, expeditionService: string): Promise<any>;
}
