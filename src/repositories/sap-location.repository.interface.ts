export default interface SapLocationRepositoryInterface {

  getByWilayahCode(wilayahCode : string) : any;
  getByZipcode(zipcode : string) : any;

}