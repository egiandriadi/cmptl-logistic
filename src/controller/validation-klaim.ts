import { Prisma, PrismaClient } from "@prisma/client";
import * as Excel from "exceljs";
import { Request, Response } from "express";
import { Readable } from "stream";
import s3 from "../config/aws-config";
import { genUUID } from "../helper";
import { calculateAmountClaim } from "../helpers/claim.helper";

const prisma = new PrismaClient();

export class ValidationKlaimController {
  static add = async (req: Request, res: Response) => {
    const { batch_validation_id, batch_validation_upload_id } = req.body;

    const validationBatchUpload =
      await prisma.t_batch_validation_upload.findFirst({
        where: {
          uuid: batch_validation_upload_id,
        },
      });
    const validationBatch = await prisma.t_batch_validation.findFirst({
      where: {
        uuid: batch_validation_id,
      },
    });

    if (!validationBatch || !validationBatchUpload) {
      return res.status(400).json({
        status: 400,
        times: new Date(),
        message:
          "Batch validation id or batch validation upload id doesn't exist",
      });
    }

    const workbook = new Excel.Workbook();
    const stream = new Readable();
    const s3Data = await s3
      .getObject({
        Bucket: "dev-simantep",
        Key: validationBatchUpload?.file_path!,
      })
      .promise();
    stream.push(s3Data.Body);
    stream.push(null);

    await workbook.xlsx.read(stream);
    const worksheet = workbook.getWorksheet(1);

    const rows: {
      trackingID: string;
      claimsAmount: number;
    }[] = [];

    worksheet?.eachRow(async (row) => {
      if (
        row.getCell(2).value !== null &&
        typeof row.getCell(5).value === "number"
      ) {
        rows.push({
          trackingID: row.getCell(2).value as string,
          claimsAmount: row.getCell(5).value as number,
        });
      }
    });

    const claims = await prisma.t_klaim.findMany({
      include: {
        order: true,
        m_kategori_klaim: true
      },
      where: {
        order: {
          nomor_resi: {
            in: rows.map((item) => item.trackingID),
          },
        },
      },
    });

    const newValidations: Prisma.t_validation_klaimCreateManyInput[] = [];

    await Promise.all(
      claims.map(async (claim) => {
        const nominal_ekspedisi = rows.find((row) => row.trackingID === claim.order.nomor_resi)?.claimsAmount;
        let nominal_order = 0;

        nominal_order = await calculateAmountClaim(claim?.m_kategori_klaim?.tipe_klaim, claim?.order)

        const isExist = await prisma.t_validation_klaim.findFirst({
          where: {
            order_id: claim.order.id,
          },
        });

        if (isExist) {
          await prisma.t_validation_klaim.update({
            where: {
              id: isExist.id,
            },
            data: {
              order_id: claim.order.id,
              batch_validation_upload_id: validationBatchUpload.id,
              batch_validation_id: validationBatch.id,
              nominal_ekspedisi,
              nominal_order,
              status: 0,
            },
          });

          return;
        }

        newValidations.push({
          uuid: genUUID(),
          created_by: validationBatchUpload.created_by,
          order_id: claim.order.id,
          batch_validation_upload_id: validationBatchUpload.id,
          batch_validation_id: validationBatch.id,
          nominal_ekspedisi,
          nominal_order,
          status: 0,
        });
      })
    );

    await prisma.t_validation_klaim.createMany({
      data: newValidations,
    });

    const count = await prisma.t_validation_klaim.count({
      where: {
        batch_validation_id: validationBatch.id,
      },
    });

    await prisma.t_batch_validation.update({
      where: { id: validationBatch.id },
      data: { jumlah_resi: count },
    });

    return res.status(201).json({
      status: 201,
      // total: payload.length,
      times: new Date(),
      message: "Insert data validation klaim success",
    });
  };
}
