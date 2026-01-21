import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, OneToOne } from "typeorm";
import { Company } from "../../../modules/companies/entities/company.entity";
import { BaseEntityHelper } from "../../../utils/entities-helpers/base-entity-helper";

@Entity()
export class TermsCondition extends BaseEntityHelper {
  @ApiProperty({ example: "Termes et Conditions Générales" })
  @Column("text")
  content: string;

  @OneToOne(() => Company, (company) => company.terms_condition, { nullable: false })
  company: Company;
}
