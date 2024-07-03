import moment from "moment";

export default class TrackHistoryDataDto {
  
  date: string;
  status: string;
  status_code: string;
  status_desc: string;
  location_code: string;

  static hydrate(data : any) {
    let obj = new TrackHistoryDataDto;
    obj.date  = moment(data.date, "DD-MM-YYYY HH:mm").format("YYYY-MM-DD HH:mm:ss");
    obj.status  = data.desc;
    obj.status_code = data.code;
    obj.status_desc = "";
    obj.location_code = "";
    return obj;
  }

}