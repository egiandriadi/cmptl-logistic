import { NextFunction, Request, Response } from "express";
import {
  CreateNewOrder,
  TagihanSchema,
  cancelOrder,
  checkTariffNinja,
  checkTrackingStatus,
} from "../schema";
import prisma from "../databases/prisma";
import { NinjaServices } from "../services/ninja.service";
import { genUUID, removeString } from "../helper";
import config from "../config/global.config";
import * as Excel from "exceljs";
import { Readable } from "stream";
import s3 from "../config/aws-config";
import { LocalStorage } from "node-localstorage";
import axios, { AxiosError } from "axios";
var localStorage = new LocalStorage("./data-ninja");
import * as log4js from "log4js";
import ResponseFormatter from "../helpers/responseFormatter.helper";
import OrderResponse from "../libs/order/order-response";
import * as NinjaApi from "../services/ninja/ninja-api";
import FlatRateService from "../services/flat-rate/flat-rate.service";
import { RequestFlatRateDto } from "../services/flat-rate/dto/request-flat-rate.dto";
import { EXPEDITION_CODE } from "../constants/expedition-code";

const baseUrl = NinjaApi.BASE_URL;
export enum typeEnum {
  COD = "COD",
  SHIPPING = "SHIPPING_COST",
  TAX = "TAX",
  WEIGHT = "WEIGHT",
  CASHBACK = "CASHBACK",
}

const logger = log4js.getLogger();
export class NinjaController {
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

        const originNinjaData = await NinjaServices.checkWilayahNinja(
          originData.kode_pos!
        );
        const destinationNinjaData = await NinjaServices.checkWilayahNinja(
          destinationData.kode_pos!
        );

        if (!originNinjaData || !destinationNinjaData?.is_coveraged) {
          throw new Error("Wilayah tidak tercover oleh ekspedisi");
        }

        const redcard = await NinjaServices.checkTariff(
          originNinjaData.city!,
          destinationNinjaData.city!,
          serviceType.toLowerCase()
        );

        if (!redcard || !redcard.amount) {
          throw new Error(
            `Layanan ${value.serviceType} ini tidak disupport untuk route pengiriman tersebut`
          );
        }

        const weight = value.weight ?? 1;
        let originalPrice = redcard.amount * weight;
        let discountPrice = originalPrice;

        // Get flat rate price
        const flatRateService = new FlatRateService();
        const requestFlatRate: RequestFlatRateDto = {
          expeditionCode: EXPEDITION_CODE.NINJA,
          expeditionService: serviceType,
          originRegionCode: originData.kode_wilayah!,
          destinationRegionCode: destinationData.kode_wilayah!,
          originalPrice: originalPrice,
          weight: weight,
        };
        const flatRate = await flatRateService.getFlatRate(requestFlatRate);
        if (flatRate) discountPrice = flatRate.price;

        return res.status(200).json({
          status: true,
          data: {
            origin_city: redcard.origin_city,
            destination_city: redcard.destination_city,
            services: redcard.services,
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

  static showToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const getToken = await this.generateToken();
    return res.json({
      status: true,
      message: "New Generate Token",
      data: {
        token: getToken,
      },
    });
  };
  static generateToken = async () => {
    const getToken = await this.getTokenNinja();
    const checkToken = getToken?.token; //await localStorage.getItem("token");
    if (!checkToken) {
      const payload = {
        client_id: config.ninja.client_id,
        client_secret: config.ninja.client_secret,
        grant_type: "client_credentials",
      };
      const { data } = await axios.post(
        `${baseUrl}2.0/oauth/access_token`,
        payload
      );
      await prisma.audit_trail.create({
        data: {
          action: "Create Token Ninja",
          module: "microservices-ekspedisi",
          logs: JSON.stringify(data),
          payload: JSON.stringify(payload),
          status_code: !data ? 0 : 200,
        },
      });
      let token = {
        token: data.access_token,
        expired: data.expires + data.expires_in,
      };

      await prisma.m_settings.upsert({
        where: {
          keys: "token_ninja",
        },
        update: { values: JSON.stringify(token) },
        create: {
          uuid: genUUID(),
          keys: "token_ninja",
          values: JSON.stringify(token),
        },
      });
      return data.access_token;
    } else {
      const token = checkToken;
      const expired = getToken?.expired; //localStorage.getItem("expired");
      const timeNow = Math.floor(Date.now() / 1000);
      if (Number(expired) > timeNow) {
        console.log("🚀 Token Ninja Existing :", token);
        console.log("🚀 Expired Time Existing :", expired);
        return token;
      } else {
        const payload = {
          client_id: config.ninja.client_id,
          client_secret: config.ninja.client_secret,
          grant_type: "client_credentials",
        };
        const { data } = await axios.post(
          `${baseUrl}oauth/access_token`,
          payload
        );
        await prisma.audit_trail.create({
          data: {
            action: "Create Token When Expired Ninja",
            module: "microservices-ekspedisi",
            logs: JSON.stringify(data),
            payload: JSON.stringify(payload),
            status_code: !data ? 0 : 200,
          },
        });
        let token = {
          token: data.access_token,
          expired: data.expires + data.expires_in,
        };

        await prisma.m_settings.upsert({
          where: {
            keys: "token_ninja",
          },
          update: { values: JSON.stringify(token) },
          create: {
            uuid: genUUID(),
            keys: "token_ninja",
            values: JSON.stringify(token),
          },
        });
        return data.access_token;
      }
    }
  };

  static getTokenNinja = async () => {
    const settingToken = await prisma.m_settings.findFirst({
      where: {
        keys: "token_ninja",
      },
    });
    if (settingToken) {
      const token = JSON.parse(settingToken.values);
      return token;
    }
    return null;
  };

  static generateTokenNow = async () => {
    const payload = {
      client_id: config.ninja.client_id,
      client_secret: config.ninja.client_secret,
      grant_type: "client_credentials",
    };
    const { data } = await axios.post(`${baseUrl}oauth/access_token`, payload);

    let token = {
      token: data.access_token,
      expired: data.expires + data.expires_in,
    };

    await prisma.m_settings.upsert({
      where: {
        keys: "token_ninja",
      },
      update: { values: JSON.stringify(token) },
      create: {
        uuid: genUUID(),
        keys: "token_ninja",
        values: JSON.stringify(token),
      },
    });
    return data.access_token;
  };
  static formatDateToYMD = function (inputDate: Date) {
    const date = new Date(inputDate);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so we add 1
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  static orderNinjaTry = async (payload: any, idAudit: number) => {
    let berhasil = false;
    let jumlahPercobaan = 0;
    const checkToken = await this.generateToken();
    let berhasilResponse;
    while (!berhasil && jumlahPercobaan < 5) {
      try {
        console.log("kesini");
        let config = {
          method: "post",
          maxBodyLength: Infinity,
          url: `${baseUrl}4.1/orders`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${checkToken?.trim()}`,
          },
          data: payload,
        };
        const { data } = await axios.request(config);
        Object.assign(payload, {
          access_token: checkToken,
        });
        await prisma.audit_trail.update({
          where: {
            id: idAudit,
          },
          data: {
            logs: JSON.stringify(data),
            status_code: 200,
          },
        });
        berhasil = true;
        berhasilResponse = {
          status: true,
          message: "Order Created",
          data: {
            tracking_number: data.tracking_number,
            order_id: data.reference.merchant_order_number,
            tlc_code: "",
          },
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            if (axiosError.response.status == 401) {
              const payload = axiosError.config?.data;
              Object.assign(payload, {
                access_token: checkToken,
              });
              await prisma.audit_trail.create({
                data: {
                  action: "Generate Resi Ninja Retry",
                  module: "microservices-ekspedisi",
                  key_id: payload.reference.merchant_order_number,
                  logs: JSON.stringify(axiosError.response.data),
                  payload: JSON.stringify(payload),
                  status_code: 401,
                },
              });
            }
          }
        }
        jumlahPercobaan++;
      }
    }
    if (berhasil) {
      return berhasilResponse;
    }
  };

  static splitString = (str: string, maxLength: number) => {
    if (str.length < maxLength) {
      return {
        RECEIVER_ADDR1: str,
        RECEIVER_ADDR2: "",
        RECEIVER_ADDR3: "",
      };
    }

    let parts: string[] = [];
    let index = 0;

    while (index < str.length) {
      parts.push(str.substring(index, index + maxLength));
      index += maxLength;
    }

    return {
      RECEIVER_ADDR1: parts[0] || "", // In case parts array doesn't have these indices
      RECEIVER_ADDR2: parts[1] || "",
      RECEIVER_ADDR3: parts[2] || "",
    };
  };

  static OrderNinja = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
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
        let items = value?.items;
        // const destinationData = await NinjaServices.checkWilayah(value.wilayah_id);
        // const destinationNinjaData = await NinjaServices.checkWilayahNinja(destinationData?.kode_pos);

        // if (!destinationNinjaData?.is_coveraged) {
        //   throw new Error("Wilayah tidak tercover oleh ekspedisi");
        // }
        let receiverAddr: string = value.to.address;
        let maxLength: number = 150;
        let resultAddress = this.splitString(receiverAddr, maxLength);

        const checkToken = await this.generateToken();
        const payload = {
          // requested_tracking_number: tn[1],
          service_type: "Marketplace",
          service_level: value.service_type,
          reference: {
            merchant_order_number: value.order_id,
          },
          marketplace: {
            seller_id: value.seller_id,
            seller_company_name: value.seller_company_name,
          },
          from: {
            name: value.from.name,
            phone_number: value.from.phone,
            address: {
              address1: value.from.address,
              address2: "",
              // kelurahan: value.from.kelurahan,
              kecamatan: value.from.kecamatan,
              city: value.from.city,
              province: value.from.province,
              postcode: value.from.postcode,
              country: "ID",
            },
          },
          to: {
            name: value.to.name,
            phone_number: value.to.phone,
            address: {
              address1: resultAddress.RECEIVER_ADDR1,
              address2: resultAddress.RECEIVER_ADDR2,
              // kelurahan: value.to.kelurahan,
              kecamatan: value.to.kecamatan,
              city: value.to.city,
              province: value.to.province,
              postcode: value.to.postcode,
              country: "ID",
            },
          },
          parcel_job: {
            is_pickup_required: true,
            pickup_service_type: "Scheduled",
            pickup_service_level: "Standard",
            pickup_date: this.formatDateToYMD(value.pickup?.date),
            pickup_timeslot: {
              start_time: "09:00",
              end_time: "22:00",
              timezone: "Asia/Jakarta",
            },
            delivery_start_date: this.formatDateToYMD(value.pickup?.date),
            delivery_timeslot: {
              start_time: "09:00",
              end_time: "22:00",
              timezone: "Asia/Jakarta",
            },
            "allow-weekend_delivery": true,
            dimensions: {
              weight: value.weight,
            },
            items: items,
            pickup_address: {
              name: value.pickup.name,
              phone_number: value.pickup.phone,
              address: {
                kelurahan: value.pickup.kelurahan,
                kecamatan: value.pickup.kecamatan,
                city: value.pickup.city,
                province: value.pickup.province,
                postcode: value.pickup.postcode,
                country: "ID",
                address1: value.pickup.address,
                address2: "",
              },
            },
          },
        };
        if (value.cod_price) {
          Object.assign(payload.parcel_job, {
            cash_on_delivery: value.cod_price,
          });
        }
        if (value.insured_value) {
          Object.assign(payload.parcel_job, {
            insured_value: value.insured_value,
          });
        }
        let config = {
          method: "post",
          maxBodyLength: Infinity,
          url: `${baseUrl}4.1/orders`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${checkToken?.trim()}`,
          },
          data: payload,
        };
        Object.assign(payload, {
          access_token: checkToken,
        });
        const auditCreate = await prisma.audit_trail.create({
          data: {
            action: "Generate Resi Ninja",
            module: "microservices-ekspedisi",
            key_id: value.order_id,
            logs: null,
            payload: JSON.stringify(payload),
            status_code: 0,
          },
        });
        const { data } = await axios.request(config);
        await await prisma.audit_trail.update({
          where: {
            id: auditCreate.id,
          },
          data: {
            logs: JSON.stringify(data),
            status_code: 200,
          },
        });

        const responseData: OrderResponse = {
          tracking_number: data.tracking_number,
          order_id: data.reference.merchant_order_number,
          tlc_code: "",
        };

        return res.status(200).json({
          status: true,
          message: "Order Created",
          data: responseData,
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            if (axiosError.response.status == 401) {
              const checkToken = await this.generateToken();
              const payload = axiosError.config?.data;
              Object.assign(payload, {
                access_token: checkToken,
              });
              const auditCreate = await prisma.audit_trail.create({
                data: {
                  action: "Generate Resi Ninja",
                  module: "microservices-ekspedisi",
                  key_id: value.order_id,
                  logs: null,
                  payload: JSON.stringify(payload),
                  status_code: 401,
                },
              });
              await this.generateTokenNow();
              const respRetry = await this.orderNinjaTry(value, auditCreate.id);
              return res.status(200).json(respRetry);
            }
          } else {
            next(axiosError);
          }
        } else {
          next(error);
        }
      }
    }
  };

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
      // const worksheet = workbook.getWorksheet("Data Tagihan 3 PL");
      const worksheet = workbook.getWorksheet(1);

      let dataExcel: any = [];
      worksheet?.eachRow(async (row, rowNumber) => {
        if (rowNumber > 1) {
          if (row.getCell(38).text?.toString().trim() == "NINJA") {
            /** Tagihan Ongkir */
            if (row.getCell(25).text !== null) {
              dataExcel.push({
                nomor_resi: row.getCell(4).text,
                fromCity: row.getCell(13).text,
                type: typeEnum.SHIPPING,
                nominal: Number(row.getCell(25).text),
                berat: Number(row.getCell(10).text),
              });
            }

            /** Tagihan CashBack */
            if (row.getCell(26).text !== null) {
              dataExcel.push({
                nomor_resi: row.getCell(4).text,
                fromCity: row.getCell(13).text,
                type: typeEnum.CASHBACK,
                nominal: Number(row.getCell(26).text),
                berat: Number(row.getCell(10).text),
              });
            }

            /** Tagihan COD Fee */
            if (row.getCell(21).text !== null) {
              dataExcel.push({
                nomor_resi: row.getCell(4).text,
                fromCity: row.getCell(13).text,
                type: typeEnum.COD,
                nominal: Number(row.getCell(21).text),
                berat: Number(row.getCell(10).text),
              });
            }

            /** Tagihan Pajak */
            if (row.getCell(27).text !== null) {
              dataExcel.push({
                nomor_resi: row.getCell(4).text,
                fromCity: row.getCell(13).text,
                type: typeEnum.TAX,
                nominal: Number(row.getCell(27).text),
                berat: Number(row.getCell(10).text),
              });
            }
          }
        }
      });
      let payload: any = [];
      console.log("🚀 ~ NinjaController ~ tagihan= ~ dataExcel:", dataExcel);

      for (let excel of dataExcel) {
        let order = await prisma.order.findFirst({
          select: {
            id: true,
            berat: true,
            fee_cod: true,
            nilai_cod: true,
            tarif: true,
            discount: true,
            created_by: true,
            batch_id: true,
            ekspedisi_id: true,
            layanan_id: true,
          },
          where: {
            nomor_resi: excel.nomor_resi,
          },
        });
        const batchTierLayanan = await prisma.m_skema_perhitungan.findFirst({
          where: {
            metode_pembayaran_id: 1,
            tipe_skema: "COMPLETED",
            ekspedisi_id: order?.ekspedisi_id!,
            layanan_id: order?.layanan_id!,
          },
        });
        let nomCompleted: any = 0;
        if (excel.type == typeEnum.COD) {
          nomCompleted = Number(
            (order?.nilai_cod! * (batchTierLayanan?.biaya! / 100)).toFixed(2)
          );
          console.log(
            "🚀 ~ NinjaController ~ tagihan= ~ nomCompleted COD:",
            nomCompleted
          );
        } else if (excel.type == typeEnum.SHIPPING) {
          nomCompleted = order?.tarif;
        } else if (excel.type == typeEnum.WEIGHT) {
          nomCompleted = order?.berat;
        } else if (excel.type == typeEnum.CASHBACK) {
          nomCompleted = Number(
            (
              order?.tarif! *
              (batchTierLayanan?.ongkos_kirim_diskon! / 100)
            ).toFixed(2)
          );
          console.log(
            "🚀 ~ NinjaController ~ tagihan= ~ nomCompleted CASHBACK:",
            nomCompleted
          );
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
      }
      // console.log("🚀 ~ NinjaController ~ tagihan= ~ payload:", payload);
      await prisma.t_tagihan.createMany({ data: payload });
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
        row.getCell(4).value !== null &&
        typeof row.getCell(20).value === "number"
      ) {
        dataExcel.push({
          nomor_resi: row.getCell(4).value,
          nominal_ekspedisi: row.getCell(20).value,
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

  static cancel = async (req: Request, res: Response) => {
    try {
      const { error } = cancelOrder.validate(req.body);

      if (error) {
        return ResponseFormatter.failed(res, {
          status: 400,
          message: removeString(error.details[0].message),
        });
      }

      const checkEkspedisi = await prisma.m_ekspedisi.findFirst({
        where: { code: "ninja" },
      });

      const statusPendingPickup = await prisma.m_group_status.findMany({
        where: {
          name: {
            in: ["Menunggu Penjemputan", "Gagal Penjemputan"],
          },
        },
        select: {
          id: true,
        },
      });

      const groupStatusPendingPickup: any =
        await prisma.m_group_status_order.findMany({
          where: {
            group_status_id: {
              in: statusPendingPickup.map((row: any) => row.id),
            },
          },
          select: {
            status_id: true,
          },
        });

      const orders: any = await prisma.order.findMany({
        where: {
          uuid: { in: req.body.order_id },
          nomor_resi: { not: null },
          status_order_id: {
            in: groupStatusPendingPickup.map((row: any) => row.status_id),
          },
          ekspedisi_id: checkEkspedisi?.id,
        },
        select: {
          id: true,
          nomor_resi: true,
          nilai_assuransi: true,
          tarif: true,
          m_metode_pembayaran: { select: { name: true } },
          batch: {
            select: {
              batch_tier_layanan: {
                select: {
                  ongkos_kirim_pajak: true,
                  tipe_schema: true,
                  m_metode_pembayaran: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (orders.length < 1) throw new Error("Data orders not found");

      const checkToken = await this.generateToken();
      const canceled = await NinjaServices.cancelOrder(
        orders,
        baseUrl,
        checkToken?.trim()
      );
      // const canceledData = await prisma.m_status_order.findFirst({
      //   where: {
      //     name: "Cancelled",
      //     ekspedisi_id: checkEkspedisi?.id,
      //   },
      // });
      // const updateMass = await prisma.order.updateMany({
      //   where: {
      //     uuid: { in: req.body.order_id },
      //   },
      //   data: {
      //     status_order_id: canceledData?.id,
      //   },
      // });
      return ResponseFormatter.success(res, {
        status: 200,
        data: canceled,
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
  };

  static updateOOC = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const filePath = req.file?.path;
    const mimeType = req.file?.mimetype;

    try {
      if (
        !filePath ||
        mimeType !==
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        return ResponseFormatter.failed(res, {
          status: 400,
          message: "File not found or file not excel",
        });
      }

      await NinjaServices.updateOOC(filePath);

      return ResponseFormatter.success(res, {
        status: 200,
        message: "Update OOC success",
      });
    } catch (error: any) {
      return ResponseFormatter.failed(res, {
        status: 400,
        message: error?.message,
      });
    }
  };

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
      });
    }

    try {
      const ninjaService = new NinjaServices();
      const { awb } = req.body;
      const token = await this.generateToken();
      const trackData = await ninjaService.getTrackingStatus(token, awb);
      return res.status(200).json({
        status: true,
        data: trackData,
      });
    } catch (err: any) {
      console.log(err);
      return res.status(400).json({
        status: 400,
        path: req.originalUrl,
        times: new Date(),
        error: err.message,
      });
    }
  };
}
