export default interface RecommendationServiceInterface {
  calculateOrderScoring(expeditionCode: string, zipcode: string): Promise<number>;
}
