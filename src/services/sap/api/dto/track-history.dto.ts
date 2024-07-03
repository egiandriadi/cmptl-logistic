export default class TrackHistoryDto {

  reference_no: string;
  awb_no: string;
  rowstate_name: string;
  description: string;
  kilo: string;
  koli: string;
  volumetric: string;
  origin_code: string | null;
  destination_code: string | null;
  shipping_cost: string | null;
  created_at: string;

  static hydrate(history: any) {
    let obj = new TrackHistoryDto;
    obj.reference_no = history.reference_no;
    obj.awb_no = history.awb_no;
    obj.rowstate_name = history.rowstate_name;
    obj.description = history.description;
    obj.kilo = history.kilo;
    obj.koli = history.koli;
    obj.volumetric = history.volumetric;
    obj.origin_code = null;
    obj.destination_code = null;
    obj.shipping_cost = null;
    obj.created_at = history.create_date;
    return obj;
  }

}