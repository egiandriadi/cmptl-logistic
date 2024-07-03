import {
  ORDER_STATUS_JNE,
  ORDER_STATUS_NINJA,
  ORDER_STATUS_SAP,
} from "../../constants/status-code";
import { dateTimeToISO } from "../../helpers/date.helper";
import { getLastWord } from "../../helpers/string.helper";
import DatabaseConfig from "../../typeorm.config";
import { StatusOrderLog } from "./dto/status.dto";

export class StatusServices {
  static getOrderData = async (uuid: string) => {
    const dataSourceManager = DatabaseConfig.manager;

    const find = await dataSourceManager.query(
      "SELECT batch_id, nomor_order, order.created_at, pelanggan_alamat, m_gudang.alamat AS alamat_penjemputan, fee_cod, `m_status_order`.name AS status_order, `nomor_resi`, `order`.`pelanggan_nama`, `order`.`pelanggan_hp`, `order`.`pelanggan_alamat`,`m_ekspedisi`.`logo`,`user`.`name`, `order`.`nilai_cod`,`order`.`nilai_barang`,`order`.`catatan_pengiriman`,`order`.`berat`,`order`.`nama_paket`,`order`.`discount`,`order`.`tarif`, `layanan_ekspedisi`.`deskripsi` FROM `order` JOIN `m_wilayah` ON `order`.`pelanggan_wilayah_id` = `m_wilayah`.`id` JOIN `m_status_order` ON `order`.`status_order_id` = `m_status_order`.`id` JOIN `batch` ON `order`.`batch_id` = `batch`.`id` JOIN `m_ekspedisi` ON `batch`.`ekspedisi_id` = `m_ekspedisi`.`id` JOIN `m_gudang` ON `batch`.`pickup_gudang_id` = `m_gudang`.`id` JOIN `user` ON `order`.`created_by` = `user`.`uuid` JOIN `layanan_ekspedisi` ON `batch`.`layanan_ekspedisi_id` = `layanan_ekspedisi`.`id` WHERE `order`.uuid = ? LIMIT 1",
      [uuid]
    );
    return find;
  };

  static getLogisticData = async (resi: string) => {
    const dataSourceManager = DatabaseConfig.manager;
    const checkTracking = await dataSourceManager.query(
      "SELECT airwaybill_number, raw, created_at, ekspedisi FROM `ekspedisi_log` WHERE airwaybill_number = ? ORDER BY created_at DESC",
      [resi]
    );
    return checkTracking;
  };

  static mapStatusLogNinja = (data: any): StatusOrderLog => {
    const logParsed = JSON.parse(data.raw);

    const statusOrderLog: StatusOrderLog = {
      airwaybill_number: data.airwaybill_number,
      created_at: data.created_at,
      status: logParsed.status,
    };
    switch (logParsed.status) {
      case ORDER_STATUS_NINJA.DELIVERED:
        statusOrderLog.status =
          logParsed?.delivery_information?.state || statusOrderLog?.status;
        statusOrderLog.images =
          logParsed?.delivery_information?.proof?.image_uris;
        statusOrderLog.signature =
          logParsed?.delivery_information?.proof?.signature_uri;
        statusOrderLog.signed_by =
          logParsed?.delivery_information?.proof?.signed_by;
        break;
      case ORDER_STATUS_NINJA.PICKUP:
        statusOrderLog.status =
          logParsed?.picked_up_information?.state || statusOrderLog?.status;
        statusOrderLog.images =
          logParsed?.picked_up_information?.proof?.image_uris;
        statusOrderLog.signature =
          logParsed?.picked_up_information?.proof?.signature_uri;
        statusOrderLog.signed_by =
          logParsed?.picked_up_information?.proof?.signed_by;
        break;
      case ORDER_STATUS_NINJA.DELIVERY_EXCEPTION:
        statusOrderLog.status =
          logParsed?.delivery_exception?.state || statusOrderLog?.status;
        statusOrderLog.failure_reason =
          logParsed?.delivery_exception?.failure_reason;
        statusOrderLog.images =
          logParsed?.delivery_exception?.proof?.image_uris;
        statusOrderLog.signature =
          logParsed?.delivery_exception?.proof?.signature_uri;
        statusOrderLog.signed_by =
          logParsed?.delivery_exception?.proof?.signed_by;
        break;
      case ORDER_STATUS_NINJA.RETURNED_TO_SENDER:
        statusOrderLog.images =
          logParsed?.delivery_information?.proof?.image_uris;
        statusOrderLog.signature =
          logParsed?.delivery_information?.proof?.signature_uri;
        statusOrderLog.signed_by =
          logParsed?.delivery_information?.proof?.signed_by;
        break;
      default:
        statusOrderLog.hub_information =
          logParsed?.arrived_at_transit_hub_information;
        break;
    }

    return statusOrderLog;
  };

  static mapStatusLogIdexpress = (data: any): StatusOrderLog => {
    const logParsed = JSON.parse(data.raw);

    const statusOrderLog: StatusOrderLog = {
      airwaybill_number: data.airwaybill_number,
      created_at: data.created_at,
      status: logParsed.operationType,
      ...(logParsed.proofOfStatus ? { images: [logParsed.proofOfStatus] } : {}),
    };

    if (logParsed.signer) {
      statusOrderLog.signed_by = {
        name: logParsed.signer,
        contact: "",
        relationship: logParsed.relation,
      };
    }

    if (logParsed.currentBranch) {
      statusOrderLog.hub_information = {
        country: "ID",
        city: getLastWord(logParsed.currentBranch),
        hub: logParsed.currentBranch,
      };
    }

    if (logParsed.problemDescription) {
      statusOrderLog.failure_reason = logParsed.problemDescription;
    }

    return statusOrderLog;
  };

  static mapStatusLogJne = (data: any): StatusOrderLog => {
    const logParsed = JSON.parse(data.raw);
    const lastIndex = logParsed.history.length - 1;
    const history = logParsed.history[lastIndex];

    const statusOrderLog: StatusOrderLog = {
      airwaybill_number: data.awb,
      created_at: data.created_at,
      status: history.status ? history.status : history.status_desc,
      ...(logParsed.photo ? { images: [logParsed.photo] } : {}),
    };

    if (logParsed.receiver_name) {
      statusOrderLog.signed_by = {
        name: logParsed.receiver_name,
        contact: "",
        relationship: logParsed.receiver_relation,
      };
    }

    if (logParsed.status === ORDER_STATUS_JNE.SHIPMENT_PROBLEM) {
      statusOrderLog.failure_reason = history.status_desc;
    }

    return statusOrderLog;
  };

  static mapStatusLogSap = (data: any): StatusOrderLog => {
    const logParsed = JSON.parse(data.raw);

    const statusOrderLog: StatusOrderLog = {
      airwaybill_number: data.airwaybill_number,
      created_at: data.created_at,
      status: logParsed.rowstate_name,
    };

    if (logParsed.rowstate_name === ORDER_STATUS_SAP.POD_UNDELIVERED) {
      statusOrderLog.failure_reason = logParsed.description;
    }

    return statusOrderLog;
  };
}
