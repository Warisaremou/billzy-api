import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Company } from "../../../modules/companies/entities/company.entity";
import { BaseEntityHelper } from "../../../utils/entities-helpers/base-entity-helper";

@Entity()
export class PaymentDetail extends BaseEntityHelper {
  @ApiProperty({ example: "Acme Corp" })
  @Column("varchar")
  owner_name: string;

  @ApiProperty({ example: "FR00 1234 5678 9012 3456 7890 1234" })
  @Column("varchar", { unique: true })
  iban: string;

  @ApiProperty({ example: "REVOFRPP" })
  @Column("varchar", { unique: true })
  bic: string;

  @ApiProperty({ example: "Revolut" })
  @Column("varchar")
  bank_name: string;

  @ManyToOne(() => Company, (company) => company.id, { nullable: false })
  @JoinColumn({ name: "company_id" })
  company: Company;
}
