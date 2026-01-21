import { ApiProperty } from "@nestjs/swagger";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Invoice } from "../../../modules/invoice/entities/invoice.entity";
import { BaseEntityHelper } from "../../../utils/entities-helpers/base-entity-helper";

@Entity()
export class InvoiceItem extends BaseEntityHelper {
  @ApiProperty({ example: "Location de voiture" })
  @Column("varchar")
  label: string;

  @ApiProperty({ example: "rouge" })
  @Column("text", { nullable: true })
  description: string;

  @ApiProperty({ example: "3" })
  @Column("int", { default: 1 })
  quantity: number;

  @ApiProperty({ example: "117,91" })
  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  unit_price: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  vat_rate: number;

  @ApiProperty({ example: 353.73 })
  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  unit_total_ht: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "invoice_id" })
  invoice: Invoice | null;

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotal() {
    if (this.quantity && this.unit_price) {
      this.unit_total_ht = this.quantity * this.unit_price;
    }
  }
}
