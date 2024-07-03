import _ from "lodash";
import OrderHistoryRepository from "../../repositories/order-history.repository";
import { ORDER_STATUS_RECEIVED, ORDER_STATUS_RTS } from "./constans";
import RecommendationServiceInterface from "./recommendation.service.interface";

export default class RecommendationService implements RecommendationServiceInterface {
  private orderHistoryRepository: OrderHistoryRepository;

  constructor() {
    this.orderHistoryRepository = new OrderHistoryRepository();
  }

  public async calculateOrderScoring(expeditionCode: string, zipcode: string): Promise<number> {
    try {
      const totalReceived = await this.orderHistoryRepository.countOrderScoring(expeditionCode, zipcode, ORDER_STATUS_RECEIVED);
      const totalRts = await this.orderHistoryRepository.countOrderScoring(expeditionCode, zipcode, ORDER_STATUS_RTS);

      const scoring = (totalReceived / (totalReceived + totalRts)) * 100;

      return _.isNaN(scoring) ? 0 : scoring;
    } catch (error) {
      console.error("Error calculating order scoring:", error);

      return 0;
    }
  }
}