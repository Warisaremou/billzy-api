import { ApiProperty } from "@nestjs/swagger";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { InvoicePaymentStatus, InvoiceStatus } from "../../../lib/types";
import { Client } from "../../../modules/clients/entities/client.entity";
import { Company } from "../../../modules/companies/entities/company.entity";
import { InvoiceItem } from "../../../modules/invoice-items/entities/invoice-item.entity";
import { BaseEntityHelper } from "../../../utils/entities-helpers/base-entity-helper";

@Entity()
export class Invoice extends BaseEntityHelper {
  @ApiProperty({ example: "20240115-1234" })
  @Column("varchar", { unique: true })
  reference: string;

  @ApiProperty({ example: "2024-01-15" })
  @Column("date", { nullable: true })
  issue_date: Date;

  @ApiProperty({ example: "2024-02-15" })
  @Column("date")
  due_date: Date;

  @ApiProperty({ example: InvoiceStatus.DRAFT })
  @Column({
    type: "enum",
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @ApiProperty({ example: InvoicePaymentStatus.UNPAID })
  @Column({
    type: "enum",
    enum: InvoicePaymentStatus,
    default: InvoicePaymentStatus.UNPAID,
  })
  payment_status: InvoicePaymentStatus;

  @ApiProperty({ example: 250.0 })
  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  total_ht: number;

  @ApiProperty({ example: 50.0 })
  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  total_vat: number;

  @ApiProperty({ example: 300.0 })
  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  total_ttc: number;

  @ManyToOne(() => Company, (company) => company.id, { nullable: false })
  @JoinColumn({ name: "company_id" })
  company: Company;

  @ManyToOne(() => Client, (client) => client.id, { nullable: false })
  @JoinColumn({ name: "client_id" })
  client: Client;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: Promise<InvoiceItem[]>;

  @BeforeInsert()
  generateReference() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.reference = `${year}${month}${day}-${randomNum}`;
  }
}
