import { NextFunction, Request, Response } from "express";
import { checkTariffNinja } from "../schema";
import { removeString } from "../helper";
import { NinjaServices } from "../services/ninja.service";

export class SicepatController {
  static checkTarif = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { error, value } = checkTariffNinja.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 400,
        path: req.originalUrl,
        times: new Date(),
        error: removeString(error.details[0].message),
      });
    } else {
      try {
        const { origin, destination, serviceType } = value;
        const originData = await NinjaServices.checkWilayah(origin);
        const destinationData = await NinjaServices.checkWilayah(destination);

        if (!originData || !destinationData)
          throw new Error("Wilayah tidak valid");

        //recomendation ninja
        const originNinjaData = await NinjaServices.checkWilayahNinja(
          originData.kode_pos!
        );
        const destinationNinjaData = await NinjaServices.checkWilayahNinja(
          destinationData.kode_pos!
        );
        const redcardNinja = await NinjaServices.checkTariffRecommendation(
          originNinjaData?.city!,
          destinationNinjaData?.city!
        );
        let objectRecommend: any[] = [];
        if (redcardNinja) {
          Object.assign(redcardNinja[0], {
            kode_pos: destinationData.kode_pos,
          });
          objectRecommend.push(redcardNinja[0]);
        }
        console.log(
          "🚀 ~ SicepatController ~ returnres.status ~ objectRecommend:",
          objectRecommend
        );
        return res.status(200).json({
          status: false,
          message: `Layanan ${value.serviceType} ini tidak disupport untuk route pengiriman tersebut`,
          data: {
            origin_city: null,
            destination_city: null,
            services: null,
            amount: null,
            recomendation: objectRecommend,
          },
        });
      } catch (error) {
        next(error);
      }
    }
  };
}
