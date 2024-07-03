import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as AWS from "aws-sdk";
import * as Excel from "exceljs";
import { Readable } from "stream";
import axios from "axios";
import config from "../config/global.config";
import s3 from "../config/aws-config";
import { number } from "joi";
import { genUUID } from "../helper";

const prisma = new PrismaClient();

export class RekonsiliasiController {
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
        select: {id:true, nilai_cod:true, nomor_resi: true},
        where: {nomor_resi: dataExcel[i].nomor_resi}
      })
      
      if(order?.id) {
        const trex = await prisma.t_rekonsiliasi.findFirst({
          select: {id:true, nomor_resi:true, status_rekonsiliasi:true},
          where: {
            nomor_resi: order.nomor_resi,
          } 
        })
        const dto = {
          uuid: genUUID(),
          batch_rekonsiliasi_id: tBatchRekonsiliasi.id,      
          batch_rekonsiliasi_upload_id: tRekonsiliasiUpload?.id, 
          orderId: order?.id,
          nomor_resi: order?.nomor_resi,                   
          nominalEkspedisi: dataExcel[i].nominal_ekspedisi || 0 ,                 
          nominalCompleted: order?.nilai_cod || 0,   
          status_rekonsiliasi: 0      
        };
        if(!trex) {
          payload.push({...dto, created_by: tBatchRekonsiliasi.created_by});
        }
        if((trex && trex.status_rekonsiliasi == 0)) {
          await prisma.t_rekonsiliasi.update(
            {where: {id:trex.id}, 
            data:{...dto, updated_at: new Date(), updated_by: tBatchRekonsiliasi.created_by}
          });
        }
      }
    }
    
    await prisma.t_rekonsiliasi.createMany({data: payload})
    return res.status(201).json({
      status: 201,
      total: payload.length,
      times: new Date(),
      message: "Insert data rekonsiliasi success",
    });
  };
}
