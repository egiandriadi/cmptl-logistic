import { CreateStatusOrderDto } from "./dto/create-status-order.dto";

export default interface StatusOrderRepositoryInterface {
  getByEkspedisiCodeAndId(code: any, id: number): Promise<any>;
  create(data: CreateStatusOrderDto): Promise<any>;
  getByName(statusName: string): Promise<any>;
  findByNames(name : string[], ekspedisiId : number) : any;
  findByName(name : string) : any;
  getByNameAndExpeditionId(statusName: string, expeditionId: number): Promise<any>;
}

