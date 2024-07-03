export default interface GroupStatusOrderRepositoryInterface {
  getJneMasterStatus(status_id : number, expeditionId : number) : Promise<any>;
}