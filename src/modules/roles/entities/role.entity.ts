import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../role.enum";

@Entity()
export class Role {
  @ApiProperty({ example: "6afc53bb-53c1-46ab-bedb-ad9bd59aa4b8" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ example: UserRole.USER })
  @Column({
    unique: true,
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  name: UserRole;
}
