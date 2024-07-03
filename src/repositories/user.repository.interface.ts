export default interface UserRepositoryInterface {
  getById(id : number) : Promise<any>;
}
