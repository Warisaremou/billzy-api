import { ApiProperty } from "@nestjs/swagger";
import { Column } from "typeorm";
import { BaseEntityHelper } from "./base-entity-helper";

export abstract class CompanyEntityHelper extends BaseEntityHelper {
  @ApiProperty({ example: "Acme Corporation" })
  @Column("varchar", { unique: true })
  name: string;

  @ApiProperty({ example: "12345678901234" })
  @Column("varchar", { length: 14, unique: true })
  siret: string;

  @ApiProperty({ example: "FR12345678901" })
  @Column("varchar", { length: 20 })
  tva_number: string;

  @ApiProperty({ example: "+33123456789" })
  @Column("varchar")
  phone: string;

  @ApiProperty({ example: "123 Main St" })
  @Column("varchar")
  address_street: string;

  @ApiProperty({ example: "75001" })
  @Column("varchar")
  address_zipcode: string;

  @ApiProperty({ example: "Paris" })
  @Column("varchar")
  address_city: string;

  @ApiProperty({ example: "France" })
  @Column("varchar")
  address_country: string;

  @ApiProperty({ example: "https://example.com/logo.png" })
  @Column("varchar", { nullable: true })
  logo_url: string;

  @ApiProperty({ example: true })
  @Column("boolean", { default: true })
  is_active: boolean;
}
