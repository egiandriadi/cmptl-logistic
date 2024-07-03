import { NextFunction, Request, Response } from "express";
import { CreateNewOrder, checkTariffSap, cancelOrder, checkTrackingStatus, TagihanSchema } from "../schema";
import { genUUID, removeString } from "../helper";
import { SapService } from "../services/sap/sap.service";
import OrderRequestDto from "../services/sap/dto/order-request.dto";
import ResponseFormatter from "../helpers/responseFormatter.helper";
import CheckCostFromApiDto from "../services/sap/dto/check-cost-from-api.dto";
import OrderResponse from "../libs/order/order-response";
import _ from "lodash";
import axios, { AxiosError } from "axios";
import * as Excel from "exceljs";
import { Readable } from "stream";
import s3 from "../config/aws-config";
import { typeEnum } from "./ninja.controller";
import FlatRateService from "../services/flat-rate/flat-rate.service";
import { RequestFlatRateDto } from "../services/flat-rate/dto/request-flat-rate.dto";
import { EXPEDITION_CODE } from "../constants/expedition-code";

export class SapController {
  static checkTarif = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.log("🚀 ~ SapApiService ~ checkTarif:", req.body);
    const { error, value } = checkTariffSap.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 400,
        path: req.originalUrl,
        times: new Date(),
        error: removeString(error.details[0].message),
      });
    } else {
      try {
        const sapService = new SapService();
        const { origin, destination, serviceType, isCod, weight } = value;

        const originData = await sapService.checkRegion(origin);
        const destinationData = await sapService.checkRegion(destination);
        const checkCostFromApiDto = CheckCostFromApiDto.hydrate(
          originData.sapLocation.district_code,
          destinationData.sapLocation.district_code,
          serviceType,
          weight,
          isCod,
          destinationData.sapLocation.cod_coverage
        );
        const costFromApi = await sapService.checkCostFromApi(
          checkCostFromApiDto
        );

        let originalPrice = costFromApi.amount;
        let discountPrice = originalPrice;

        // Get flat rate price
        const flatRateService = new FlatRateService();
        const requestFlatRate: RequestFlatRateDto = {
          expeditionCode: EXPEDITION_CODE.SAP,
          expeditionService: serviceType,
          originRegionCode: originData.kode_wilayah,
          destinationRegionCode: destinationData.kode_wilayah,
          originalPrice: originalPrice,
          weight: weight,
        }
        const flatRate = await flatRateService.getFlatRate(requestFlatRate);
        if (flatRate) discountPrice = flatRate.price;

        return res.status(200).json({
          status: true,
          data: {
            origin_city: originData.region.kabupaten_kota,
            destination_city: destinationData.region.kabupaten_kota,
            services: costFromApi.services,
            amount: discountPrice,
            original_amount: originalPrice,
            ...(flatRate ? { flat_rate: flatRate.flatRate } : {}),
          },
        });
      } catch (error) {
        next(error);
      }
    }
  };

  static createOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.log("🚀 ~ SapApiService ~ createOrder:", req.body);
    const { error, value } = CreateNewOrder.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 400,
        path: req.originalUrl,
        times: new Date(),
        error: removeString(error.details[0].message),
      });
    } else if (value.isCod && !value.cod_price) {
      return res.status(400).json({
        status: 400,
        path: req.originalUrl,
        times: new Date(),
        error: "Cod Price is Required",
      });
    } else {
      try {
        const sapService = new SapService();
        const orderRequestDto = new OrderRequestDto(req);
        const orderData = await sapService.createOrder(orderRequestDto);
        const tlcCode =
          orderData?.origin_branch_code +
          " - " +
          orderData?.destination_branch_code;
        const responseData: OrderResponse = {
          tracking_number: orderData?.awb_no ?? "",
          order_id: orderData?.reference_no ?? "",
          tlc_code: tlcCode,
        };

        return res.status(200).json({
          status: true,
          message: "Order Created",
          data: responseData,
        });
      } catch (error) {
        if (error instanceof Error) {
          return res.status(400).json({
            status: 400,
            path: req.originalUrl,
            times: new Date(),
            error: error.message,
          });
        }
      }
    }
  };

  static cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sapService = new SapService();
      console.log("🚀 ~ SapApiService ~ cancelOrder:", req.body);
      const { error } = cancelOrder.validate(req.body);

      if (error) {
        return ResponseFormatter.failed(res, {
          status: 400,
          message: removeString(error.details[0].message),
        });
      }
      const { order_id } = req.body;
      const result = await sapService.cancelOrder(order_id);
      return ResponseFormatter.success(res, {
        status: 200,
        data: result,
      });
    } catch (error: any) {
      error =
        error?.message ||
        error?.response?.data?.data?.message ||
        error?.response?.data ||
        error ||
        "Error Cancel Order";
      return ResponseFormatter.failed(res, {
        status: 400,
        message: error,
      });
    }
  }

  static trackStatus = async (    
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    const { error, value } = checkTrackingStatus.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: 400,
        path: req.originalUrl,
        times: new Date(),
        error: removeString(error.details[0].message),
      })
    }
    
    try {
      const sapService  = new SapService();
      const { awb } = req.body;        
      const trackData = await sapService.getTrackingStatus(awb);
      return res.status(200).json({
        status: true,
        data: trackData       
      })
    } catch (err: any) {
      return res.status(400).json({
        status: 400,
        path: req.originalUrl,
        times: new Date(),
        error: err.message
      });
    }
  }

  static tagihan = async (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = TagihanSchema.validate(req.body);
    try {
      if (error) {
        return res.status(400).json({
          status: 400,
          path: req.originalUrl,
          times: new Date(),
          error: removeString(error.details[0].message),
        });
      }
      const checkBatchTagihan = await prisma.t_batch_tagihan.findFirst({
        where: {
          uuid: value.batch_tagihan_id,
        },
      });
      if (!checkBatchTagihan) throw new Error("Batch tidak ditemukan");
      const checkBatchUpload = await prisma.t_batch_tagihan_upload.findFirst({
        where: {
          uuid: value.batch_tagihan_upload_id,
        },
      });
      if (!checkBatchUpload) throw new Error("Batch tidak ditemukan");

      const workbook = new Excel.Workbook();
      const stream = new Readable();
      const s3Data = await s3
        .getObject({
          Bucket: "dev-simantep",
          Key: checkBatchUpload.file_path!,
        })
        .promise();
      stream.push(s3Data.Body);
      stream.push(null);

      await workbook.xlsx.read(stream);
      const worksheet = workbook.getWorksheet(1);

      let dataExcel: any = [];
      worksheet?.eachRow(async (row, rowNumber) => {
        if (
          row.getCell(3).value !== null &&
          typeof row.getCell(17).value === "number"
        ) {
          dataExcel.push({
            nomor_resi: row.getCell(3).value,
            fromCity: row.getCell(12).value,
            type: typeEnum.SHIPPING,
            nominal: row.getCell(17).value,
            berat: row.getCell(9).value,
          });
        }
        if (
          row.getCell(3).value !== null &&
          typeof row.getCell(20).value === "number"
        ) {
          dataExcel.push({
            nomor_resi: row.getCell(3).value,
            fromCity: row.getCell(12).value,
            type: typeEnum.COD,
            nominal: row.getCell(20).value,
            berat: row.getCell(9).value,
          });
        }
        if (
          row.getCell(3).value !== null &&
          typeof row.getCell(9).value === "number"
        ) {
          dataExcel.push({
            nomor_resi: row.getCell(3).value,
            fromCity: row.getCell(12).value,
            type: typeEnum.WEIGHT,
            nominal: row.getCell(17).value,
            berat: row.getCell(9).value,
          });
        }
      });
      let payload: any = [];
      for (let excel of dataExcel) {
        let order = await prisma.order.findFirst({
          select: {
            id: true,
            berat: true,
            fee_cod: true,
            tarif: true,
            created_by: true,
          },
          where: {
            nomor_resi: excel.nomor_resi,
          },
        });
        let nomCompleted: any = 0;
        if (excel.type == typeEnum.COD) {
          nomCompleted = order?.fee_cod;
        } else if (excel.type == typeEnum.SHIPPING) {
          nomCompleted = order?.tarif;
        } else if (excel.type == typeEnum.WEIGHT) {
          nomCompleted = order?.tarif;
        }
        if (order?.id) {
          const checkTrx = await prisma.t_tagihan.findFirst({
            where: {
              order_id: order?.id,
              type: excel.type,
              status_tagihan: 0,
            },
          });
          if (checkTrx) {
            await prisma.t_tagihan.update({
              where: {
                id: checkTrx.id,
              },
              data: {
                order_id: order.id,
                from_city: excel.fromCity,
                nominal_ekspedisi: excel.nominal,
                nominal_completed: nomCompleted,
                berat_ekspedisi: excel.berat,
                berat_completed: order?.berat,
              },
            });
          } else {
            payload.push({
              uuid: genUUID(),
              batch_tagihan_id: checkBatchTagihan.id,
              batch_tagihan_upload_id: checkBatchUpload.id,
              type: excel.type,
              status_tagihan: 0,
              order_id: order.id,
              from_city: excel.fromCity,
              nominal_ekspedisi: excel.nominal,
              nominal_completed: nomCompleted,
              berat_ekspedisi: excel.berat,
              berat_completed: order?.berat,
              created_by: order.created_by,
            });
          }
        }
        await prisma.t_tagihan.createMany({ data: payload });
      }
      return res.status(201).json({
        status: 201,
        total: payload.length,
        times: new Date(),
        message: "Insert data tagihan success",
      });
    } catch (err) {
      next(err);
    }
  };

  static add = async (req: Request, res: Response, next: NextFunction) => {
    const { batch_rekonsiliasi_id } = req.body;

    const tBatchRekonsiliasi = await prisma.t_batch_rekonsiliasi.findFirst({
      where: { uuid: batch_rekonsiliasi_id },
    });
    if (!tBatchRekonsiliasi) {
      return res.status(404).json({
        status: 404,
        times: new Date(),
        message: "Batch rekonsiliasi tidak ditemukan",
      });
    }

    const tRekonsiliasiUpload =
      await prisma.t_batch_rekonsiliasi_upload.findFirst({
        select: { id: true, url: true, url_path: true },
        where: { batch_rekonsiliasi_id: tBatchRekonsiliasi.id },
        orderBy: { created_at: "desc" },
      });
    if (!tRekonsiliasiUpload) {
      return res.status(404).json({
        status: 404,
        times: new Date(),
        message: "Data upload rekonsiliasi tidak ditemukan",
      });
    }
    const workbook = new Excel.Workbook();
    const stream = new Readable();
    const s3Data = await s3
      .getObject({ Bucket: "dev-simantep", Key: tRekonsiliasiUpload.url_path! })
      .promise();
    stream.push(s3Data.Body);
    stream.push(null);

    await workbook.xlsx.read(stream);
    const worksheet = workbook.getWorksheet(1);

    let dataExcel: any = [];
    worksheet?.eachRow(async (row, rowNumber) => {
      if (
        row.getCell(3).value !== null &&
        typeof row.getCell(19).value === "number"
      ) {
        dataExcel.push({
          nomor_resi: row.getCell(3).value,
          nominal_ekspedisi: row.getCell(19).value,
        });
      }
    });
    let payload: any = [];
    for (let i = 0; i < dataExcel.length; i++) {
      let order = await prisma.order.findFirst({
        select: { id: true, nilai_cod: true, nomor_resi: true },
        where: { nomor_resi: dataExcel[i].nomor_resi },
      });

      if (order?.id) {
        const trex = await prisma.t_rekonsiliasi.findFirst({
          select: { id: true, nomor_resi: true, status_rekonsiliasi: true },
          where: {
            nomor_resi: order.nomor_resi,
          },
        });
        const dto = {
          uuid: genUUID(),
          batch_rekonsiliasi_id: tBatchRekonsiliasi.id,
          batch_rekonsiliasi_upload_id: tRekonsiliasiUpload?.id,
          order_id: order?.id,
          nomor_resi: order?.nomor_resi,
          nominal_ekspedisi: dataExcel[i].nominal_ekspedisi || 0,
          nominal_completed: order?.nilai_cod || 0,
          status_rekonsiliasi: 0,
        };
        if (!trex) {
          payload.push({ ...dto, created_by: tBatchRekonsiliasi.created_by });
        }
        if (trex && trex.status_rekonsiliasi == 0) {
          console.log("🚀 ~ NinjaController ~ add= ~ dto:", dto);
          await prisma.t_rekonsiliasi.update({
            where: { id: trex.id },
            data: {
              ...dto,
              updated_at: new Date(),
              updated_by: tBatchRekonsiliasi.created_by,
            },
          });
        }
      }
    }
    await prisma.t_rekonsiliasi.createMany({ data: payload });
    return res.status(201).json({
      status: 201,
      total: payload.length,
      times: new Date(),
      message: "Insert data rekonsiliasi success",
    });
  };
}