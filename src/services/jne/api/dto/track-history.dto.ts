import _ from "lodash";
import TrackResponseDto from "./track-response.dto";
import TrackHistoryDataDto from "./track-history-data.dto";

const DELIVERED = "DELIVERED";

export default class TrackHistoryDto {

  awb : string;
  order_id : string;
  status : string;
  actual_weight : string;
  actual_ongkir : string;
  service : string;
  signature : string;
  photo : string;
  receiver_name : string;
  receiver_relation : string;
  actual_receiver_address : string;
  actual_receiver_city_name : string;
  actual_receiver_city_code : string;
  actual_sender_name : string;
  actual_sender_address : string;
  goods_desc : string;
  cod_amount : string;
  origin_code : string;
  dest_code : string;
  history : any;

  static hydrate(data : TrackResponseDto, podStatus : string, historyIndex : number) {

    let shipper_address = "";
    let receiver_address = "";
    const { cnote, history, detail } = data;

    shipper_address += detail.cnote_shipper_addr1 ?? "";
    shipper_address += detail.cnote_shipper_addr2 ?? "";
    shipper_address += detail.cnote_shipper_addr3 ?? "";

    receiver_address += detail.cnote_receiver_addr1 ?? "";
    receiver_address += detail.cnote_receiver_addr2 ?? "";
    receiver_address += detail.cnote_receiver_addr3 ?? "";

    let obj = new TrackHistoryDto;
    obj.awb = data.cnote.cnote_no;
    obj.order_id = cnote.reference_number;
    obj.status = podStatus;
    obj.actual_weight = cnote.cnote_weight;
    obj.actual_ongkir = cnote.cnote_amount;
    obj.service = cnote.cnote_service_code;
    obj.signature = cnote.signature;
    obj.photo = cnote.photo;
    obj.receiver_name = detail.cnote_receiver_name;
    obj.receiver_relation = "";
    obj.actual_receiver_address = cnote.pod_status === DELIVERED ? receiver_address : "";
    obj.actual_receiver_city_name = cnote.pod_status === DELIVERED ? detail.cnote_receiver_city : "";
    obj.actual_receiver_city_code = cnote.pod_status === DELIVERED ? detail.cnote_destination : "";
    obj.actual_sender_name = cnote.pod_status === DELIVERED ? detail.cnote_shipper_name : "";
    obj.actual_sender_address = cnote.pod_status === DELIVERED ? shipper_address : "";
    obj.goods_desc = data.cnote.cnote_goods_descr;
    obj.cod_amount = "";
    obj.origin_code = cnote.cnote_origin;
    obj.dest_code = cnote.cnote_destination;
    obj.history = _.chain(history).filter((h, index : number) => {
                    return historyIndex >= index
                  }).map((h : any, index : number) => {
                    return TrackHistoryDataDto.hydrate(h);
                  }).value();

    return obj;

  }

}