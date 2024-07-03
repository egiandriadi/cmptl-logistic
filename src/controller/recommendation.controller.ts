import { NextFunction, Request, Response } from "express";
import { checkTariffRecommendation } from "../schema";
import { removeString } from "../helper";
import { SapService } from "../services/sap/sap.service";
import { IdexpressService } from "../services/idexpress/idexpress.service";
import { RequestTariffDto as IdexpressRequestTariffDto } from "../services/idexpress/dto/request-tariff.dto";
import JneRequestTariffDto from "../services/jne/dto/request-tariff.dto";
import { NinjaServices } from "../services/ninja.service";
import CheckCostFromApiDto from "../services/sap/dto/check-cost-from-api.dto";
import { JneService } from "../services/jne/jne.service";
import RecommendationService from "../services/recommendation/recommendation.service";
import { IDEXPRESS_TYPE_LITE, IDEXPRESS_TYPE_STANDARD } from "../services/idexpress/constans";

export class RecommendationController {
  // private static EXPEDITION_NINJA_CODE = "ninja";
  private static EXPEDITION_IDEXPRESS_CODE = "idexpress";
  private static EXPEDITION_JNE_CODE = "jne";
  private static EXPEDITION_SAP_CODE = "sap";

  static checkTarif = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { error, value } = checkTariffRecommendation.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 400,
        path: req.originalUrl,
        times: new Date(),
        error: removeString(error.details[0].message),
      });
    } else {
      let objectRecommend: any[] = [];
      let kode_pos;

      const recommendationService = new RecommendationService();

      // if (value.exclude_expedition_code !== this.EXPEDITION_NINJA_CODE) {
      //   try {
      //     const originData = await NinjaServices.checkWilayah(value.origin);
      //     const destinationData = await NinjaServices.checkWilayah(
      //       value.destination
      //     );
      //     kode_pos = destinationData?.kode_pos!;

      //     const redcardNinja = await NinjaServices.checkTariffRecommendation(
      //       originData,
      //       destinationData
      //     );

      //     const score = await recommendationService.calculateOrderScoring(
      //       this.EXPEDITION_NINJA_CODE,
      //       kode_pos
      //     );

      //     if (redcardNinja) {
      //       redcardNinja[0].score_ekspedisi = score;

      //       Object.assign(redcardNinja[0], {
      //         kode_pos: destinationData?.kode_pos,
      //       });
      //       objectRecommend.push(redcardNinja[0]);
      //     }
      //   } catch (error) {
      //     console.log("🚀 ~ RecommendationController ~ Ninja ~ error:", error);
      //   }
      // }

      if (value.exclude_expedition_code !== this.EXPEDITION_IDEXPRESS_CODE) {
        const idexpressService = new IdexpressService();
        const serviceType = [IDEXPRESS_TYPE_STANDARD, IDEXPRESS_TYPE_LITE];
        for (let i = 0; i < serviceType.length; i++) {
          try {
            const dataGetTarif = new IdexpressRequestTariffDto();
            dataGetTarif.origin = value.origin;
            dataGetTarif.destination = value.destination;
            dataGetTarif.serviceType = serviceType[i];
            dataGetTarif.weight = value.weight ?? 1;
            dataGetTarif.isCod = value.isCod ?? false;

            const tariff = await idexpressService.getTarifRecommendation(
              dataGetTarif
            );
            const score = await recommendationService.calculateOrderScoring(
              this.EXPEDITION_IDEXPRESS_CODE,
              kode_pos!
            );

            if (tariff && tariff.amount != null) {
              tariff.score_ekspedisi = score;

              Object.assign(tariff, {
                kode_pos: kode_pos,
              });
              objectRecommend.push(tariff);
            }
          } catch (error) {
            console.log(
              "🚀 ~ RecommendationController ~ Idexpress ~ error:",
              error
            );
          }
        }
      }

      if (value.exclude_expedition_code !== this.EXPEDITION_SAP_CODE) {
        const sapService = new SapService();
        const serviceType = ["UDRREG"];
        for (let i = 0; i < serviceType.length; i++) {
          try {
            const { origin, destination, isCod, weight } = value;

            const originData = await sapService.checkRegion(origin);
            const destinationData = await sapService.checkRegion(destination);
            const checkCostFromApiDto = CheckCostFromApiDto.hydrate(
              originData.sapLocation.district_code,
              destinationData.sapLocation.district_code,
              serviceType[i],
              weight,
              isCod,
              destinationData.sapLocation.cod_coverage
            );
            const costFromApi = await sapService.getTarifRecommendation(
              checkCostFromApiDto,
              origin,
              destination
            );
            const score = await recommendationService.calculateOrderScoring(
              this.EXPEDITION_SAP_CODE,
              kode_pos!
            );
            console.log(
              "🚀 ~ RecommendationController ~ SAP ~ costFromApi:",
              costFromApi
            );

            if (costFromApi && costFromApi.amount != null) {
              costFromApi.score_ekspedisi = score;

              Object.assign(costFromApi, {
                kode_pos: kode_pos,
              });
              objectRecommend.push(costFromApi);
            }
          } catch (error) {
            console.log("🚀 ~ RecommendationController ~ SAP ~ error:", error);
          }
        }
      }

      if (value.exclude_expedition_code !== this.EXPEDITION_JNE_CODE) {
        const jneService = new JneService();
        const serviceType = ["REG15", "REG23"];
        for (let i = 0; i < serviceType.length; i++) {
          try {
            const dataGetTarif = new JneRequestTariffDto();
            dataGetTarif.origin = value.origin;
            dataGetTarif.destination = value.destination;
            dataGetTarif.serviceType = serviceType[i];
            dataGetTarif.weight = value.weight ?? 1;
            dataGetTarif.codType = value.isCod ?? false;

            const tariff = await jneService.getTarifRecommendation(
              dataGetTarif
            );
            const score = await recommendationService.calculateOrderScoring(
              this.EXPEDITION_JNE_CODE,
              kode_pos!
            );

            if (tariff && tariff.amount != null) {
              tariff.score_ekspedisi = score;

              Object.assign(tariff, {
                kode_pos: kode_pos,
              });
              objectRecommend.push(tariff);
            }
          } catch (error) {
            console.log("🚀 ~ RecommendationController ~ JNE ~ error:", error);
          }
        }
      }

      console.log(
        "🚀 ~ RecommendationController ~ objectRecommend:",
        objectRecommend
      );

      return res.status(200).json({
        status: true,
        data: objectRecommend,
      });
    }
  };
}
