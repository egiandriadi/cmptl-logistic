export default interface EkspedisiLogRepositoryInterface {

  getByAwb(expeditionCode: string, awb: string): any;

}