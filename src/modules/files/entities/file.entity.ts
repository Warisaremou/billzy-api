import { ApiProperty } from "@nestjs/swagger";
import { Allow } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class File {
  @ApiProperty({ example: "6afc53bb-53c1-46ab-bedb-ad9bd59aa4b8" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ example: "/uploads/documents/invoice.pdf" })
  @Allow()
  @Column("varchar")
  path: string;
}
