import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity({
  name: "ekspedisi_log",
})
export class EkspedisiLog extends BaseEntity {
  @Column()
  order_id: string;

  @Column()
  ekspedisi: string;

  @Column()
  airwaybill_number: string;

  @Column({
    type: "text",
  })
  raw: string;
}
