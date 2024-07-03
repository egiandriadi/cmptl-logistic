import { Request, Response, NextFunction } from "express";
import ValidationService from "../services/validation/validation.service";
import _ from "lodash";

export default class OrderValidationController {

  static validate = async(
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validationService = new ValidationService;
      const errors = await validationService.validate(req.body);
      if (_.isEmpty(errors)) {
        res.status(200).json({
          status: 200,
          message: "success",
          data: []
        });
      } else {
        res.status(200).json({
          status: 400,
          message: "failed",
          data: [errors]
        })
      }
    } catch (err) {
      return err;
    }
  }

}