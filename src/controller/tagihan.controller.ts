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

export class TagihanController {
  static add = async (req: Request, res: Response, next: NextFunction) => {
    const { batch_tagihan_id } = req.body;

    const tBatchTagihan = await prisma.t_batch_tagihan.findFirst({
      where: { uuid: batch_tagihan_id },
    });
    if (!tBatchTagihan) {
      return res.status(404).json({
        status: 404,
        times: new Date(),
        message: "Batch tagihan tidak ditemukan",
      });
    }

    const tTagihanUpload =
      await prisma.t_batch_tagihan_upload.findFirst({
        select: { id: true, url: true, file_path: true },
        where: { batch_tagihan_id: tBatchTagihan.id },
      });
    if (!tTagihanUpload) {
      return res.status(404).json({
        status: 404,
        times: new Date(),
        message: "Data upload tagihan tidak ditemukan",
      });
    }

    const workbook = new Excel.Workbook();
    const stream = new Readable();
    const s3Data = await s3
      .getObject({ Bucket: "dev-simantep", Key: tTagihanUpload.file_path! })
      .promise();
    stream.push(s3Data.Body);
    stream.push(null);

    await workbook.xlsx.read(stream);
    const worksheet = workbook.getWorksheet(1);

    let dataExcel: any = [];
    worksheet?.eachRow(async (row, rowNumber) => {
      if (
        row.getCell(3).value !== null 
        && row.getCell(17).value !== null 
        && typeof row.getCell(17).value === "number"
      ) {
        dataExcel.push({
          nomor_resi: row.getCell(3).value,
          nominal_ekspedisi: row.getCell(17).value,
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
        payload.push({
          uuid: genUUID(),
          batch_tagihan_id: tBatchTagihan.id,      
          batch_tagihan_upload_id: tTagihanUpload?.id, 
          orderId: order?.id,
          type: 'SHIPPING_COST', 
          nominalEkspedisi: dataExcel[i].nominal_ekspedisi || 0 ,                 
          nominalCompleted: order?.nilai_cod || 0,   
          statusTagihan: 0,        
          created_by: tBatchTagihan.created_by
        });
      }
    }
    const response = await prisma.t_tagihan.createMany({data: payload});

    let dataExcelFeeCOD: any = [];
    worksheet?.eachRow(async (row, rowNumber) => {
      if (
        row.getCell(3).value !== null 
        && row.getCell(20).value !== null 
        && typeof row.getCell(20).value === "number"
      ) {
        dataExcelFeeCOD.push({
          nomor_resi: row.getCell(3).value,
          nominal_ekspedisi: row.getCell(20).value,
        });
      }
    });

    let payload_fee_cod: any = [];
    for (let i = 0; i < dataExcelFeeCOD.length; i++) {
      let order = await prisma.order.findFirst({
        select: {id:true, nilai_cod:true, nomor_resi: true},
        where: {nomor_resi: dataExcelFeeCOD[i].nomor_resi}
      })
      
      if(order?.id) {
        payload_fee_cod.push({
          uuid: genUUID(),
          batch_tagihan_id: tBatchTagihan.id,      
          batch_tagihan_upload_id: tTagihanUpload?.id, 
          orderId: order?.id,
          type: 'COD',
          nominalEkspedisi: dataExcelFeeCOD[i].nominal_ekspedisi || 0 ,                 
          nominalCompleted: order?.nilai_cod || 0,   
          statusTagihan: 0,        
          created_by: tBatchTagihan.created_by
        });
      }
    }
    const responseFeeCOD = await prisma.t_tagihan.createMany({data: payload_fee_cod});
    
    return res.status(201).json({
      status: 201,
      total_tarif: payload.length,
      total_fee_cod: payload_fee_cod.length,
      times: new Date(),
      message: "Insert data tagihan success",
    });
  };
}
