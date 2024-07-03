import { Column, CreateDateColumn, Generated, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id:number;

    @Column('uuid')
    @Generated('uuid')
    uuid:string;


    @Column({ nullable: true, name: "created_by" })
  createdBy!: string;

  @Column({ nullable: true, name: "updated_by" })
  updatedBy!: string;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updatedAt: Date;
}