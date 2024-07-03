export default interface OrderRepositoryInterface {
  getByNomorOrder(nomor : string) : Promise<any>;
  getByUUIDs( UUIDs: string[], ekspedisiId : number) : any;
  getForCancelOrders(uuids: string[], expeditionCode: string): Promise<any>;
  updateStatusMany(uuids: string[], statusName: string): Promise<any>;
  getByAwbAndExpeditionCode(awb: string, expeditionCode: string): Promise<any>;
}
