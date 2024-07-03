import axios from "axios";
import DatabaseConfig from "../typeorm.config";
import prisma from "../databases/prisma";
import readXlsxFile from "read-excel-file/node";
import { from, concatMap, Observable, subscribeOn } from "rxjs";
import SettingRepository from "../repositories/setting.repository";
import * as NinjaApi from "./ninja/ninja-api";
export class NinjaServices {
  static checkWilayah = async (id: number) => {
    const getWilayah = await prisma.m_wilayah.findFirst({
      where: {
        id,
      },
    });
    return getWilayah;
  };
  static checkWilayahNinja = async (kodePos: string) => {
    const getWilayah = await prisma.m_ninja_locations.findFirst({
      where: {
        zipcode: kodePos,
      },
    });
    return getWilayah;
  };
  static checkTariff = async (
    origin: string,
    destination: string,
    serviceType: string
  ) => {
    const getTariff = await prisma.m_ninja_rate_card.findFirst({
      where: {
        origin_city: origin,
        destination_city: destination,
        services: serviceType,
      },
    });
    return getTariff;
  };

  public async getRecommendation(originId: any, destinationId: any) {
    const originData = await NinjaServices.checkWilayah(originId);

    const destinationData = await NinjaServices.checkWilayah(destinationId);

    const redcardNinja = await NinjaServices.checkTariffRecommendation(
      originData,
      destinationData
    );
    let objectRecommend: any[] = [];
    if (redcardNinja) {
      Object.assign(redcardNinja[0], {
        kode_pos: destinationData?.kode_pos,
      });
      objectRecommend.push(redcardNinja[0]);
    }
    return objectRecommend;
  }

  static checkTariffRecommendation = async (origin: any, destination: any) => {
    const originNinjaData = await NinjaServices.checkWilayahNinja(
      origin.kode_pos
    );
    const destinationNinjaData = await NinjaServices.checkWilayahNinja(
      destination.kode_pos
    );

    const dataSourceManager = DatabaseConfig.manager;
    const getRedCard = await dataSourceManager.query(
      `SELECT 
          m_ekspedisi.NAME AS ekspedisi_name,
          m_ekspedisi.description AS ekspedisi_description,
          m_ekspedisi.CODE AS ekspedisi_code,
          m_ekspedisi.logo AS ekspedisi_logo,
          m_ekspedisi.id AS ekspedisi_id,
          layanan_ekspedisi.id AS layanan_ekspedisi_id,
          m_ninja_rate_card.* 
       FROM m_ninja_rate_card 
       LEFT JOIN m_ekspedisi ON code = ?
       LEFT JOIN layanan_ekspedisi ON LOWER(m_ninja_rate_card.services) = LOWER(layanan_ekspedisi.nama)
       WHERE origin_city = ? AND destination_city = ? LIMIT 1 `,
      ["ninja", originNinjaData?.city, destinationNinjaData?.city]
    );
    return getRedCard;
  };

  static cancelOrder = async (
    orders: any,
    baseUrl: string,
    token: string,
    retry: number = 0,
    success: number = 0
  ): Promise<any> => {
    let listFails: any = [];
    let listSuccess: any = [];
    const headers: any = { Authorization: `Bearer ${token}` };
    const urlParams: string = `${baseUrl}2.2/orders`;

    if (retry <= 5) {
      const statusCancelled = await prisma.m_status_order.findFirst({
        where: { name: "Cancelled" },
      });

      await Promise.all(
        orders.map(async (order: any) => {
          const nomorResi = order.nomor_resi;
          console.log(
            "🚀 ~ NinjaServices ~ orders.map ~ nomorResi:",
            nomorResi
          );
          const orderId = `${order.id}`;

          if (nomorResi) {
            try {
              const canceled = await axios.delete(`${urlParams}/${nomorResi}`, {
                headers,
              });
              console.log(
                "🚀 ~ NinjaServices ~ orders.map ~ canceled:",
                canceled
              );
              if (order?.m_metode_pembayaran.name === "NON COD") {
                const nonCodTier = order.batch.batch_tier_layanan.find(
                  (row: any) =>
                    row.m_metode_pembayaran.name === "NON COD" &&
                    row.tipe_schema == "CLIENT"
                      ? row
                      : null
                );
                console.log(
                  "🚀 ~ NinjaServices ~ nonCodTier ~ nonCodTier:",
                  nonCodTier
                );
              }
              await prisma.order.update({
                where: { id: order.id },
                data: { status_order_id: statusCancelled?.id },
              });
              await prisma.audit_trail.create({
                data: {
                  action: "Cancel Order Ninja",
                  module: "microservices-ekspedisi",
                  key_id: orderId,
                  logs: JSON.stringify(canceled?.data),
                  payload: nomorResi,
                  status_code: 200,
                },
              });
              listSuccess.push(order);
            } catch (error: any) {
              const errorMsg = error?.response?.data?.data || error;
              await prisma.audit_trail.create({
                data: {
                  action: "Cancel Order Ninja",
                  module: "microservices-ekspedisi",
                  key_id: orderId,
                  logs: JSON.stringify(errorMsg),
                  payload: nomorResi,
                  status_code: error?.response?.status || 400,
                },
              });
              listFails.push(order);
            }
          }
        })
      );
    }

    retry++;
    success = success + listSuccess.length;

    if (listFails.length >= 1 && retry <= 5)
      return this.cancelOrder(listFails, baseUrl, token, retry, success);

    return { success: success, failed: listFails.length };
  };

  static updateOOC = async (filePath: string) => {
    try {
      await prisma.m_ninja_locations.updateMany({
        data: {
          is_coveraged: true,
        },
      });

      await readXlsxFile(filePath).then((rows: any) => {
        from(rows)
          .pipe(
            concatMap((row: any, index) => {
              console.log(row);
              return new Observable(subscribe => {
                if (index === 0) subscribe.complete();
                /**
                 * row[0] = province
                 * row[1] = regency
                 * row[2] = district
                 * row[3] = district_detail
                 */
                prisma.m_ninja_locations
                  .updateMany({
                    where: {
                      province: row[0],
                      regency: row[1],
                      district: row[2],
                    },
                    data: {
                      is_coveraged: false,
                    },
                  })
                  .then(res => {
                    subscribe.next(res);
                    subscribe.complete();
                  })
                  .catch(err => {
                    subscribe.error(err);
                  });
              });
            })
          )
          .subscribe({
            next: data => {
              console.log(data);
            },
            error: err => {
              console.log(err);
            },
            complete: () => {
              console.log("Generate data complete.");
            },
          });
      });
    } catch (error: any) {
      throw error;
    }
  };

  async getTrackingStatus(token: string, awb: string) {
    try {
      const settingRepository: SettingRepository = new SettingRepository();
      const trackUrl = NinjaApi.TRACK_URL + awb;
      console.log("token:" + token);
      const res = await axios.get(trackUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }
}
