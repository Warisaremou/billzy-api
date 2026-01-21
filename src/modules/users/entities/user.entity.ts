import { ApiProperty } from "@nestjs/swagger/dist/decorators/index";
import { Exclude, Transform } from "class-transformer";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Company } from "../../companies/entities/company.entity";
import { Role } from "../../roles/entities/role.entity";

@Index("IDX_USER_ID", ["id"], { unique: true })
@Index("IDX_USER_EMAIL", ["email"], { unique: true })
@Index("IDX_USER_HASH", ["hash"], { unique: true })
@Entity()
export class User {
  @ApiProperty({ example: "6afc53bb-53c1-46ab-bedb-ad9bd59aa4b8" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ example: "user@example.com" })
  @Column("varchar", {
    unique: true,
  })
  email: string;

  @ApiProperty({ example: "John" })
  @Column("varchar")
  first_name: string;

  @ApiProperty({ example: "Doe" })
  @Column("varchar")
  last_name: string;

  @ApiProperty({ example: "password123" })
  @Column("varchar", { nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({ example: false })
  @Column("boolean", { default: false })
  is_active: boolean;

  @ApiProperty({ example: "6afc53bb-53c1-46ab-bedb-ad9bd59aa4b8" })
  @ManyToOne(() => Role)
  @JoinColumn({ name: "role_id" })
  @Transform(({ value }) => value.name, { toPlainOnly: true })
  role: Role;

  @ManyToMany(() => Company, (company) => company.users, { cascade: true })
  @JoinTable()
  companies: Promise<Company[]>;

  @Column("varchar", { nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  hash: string;

  @Column("varchar", { nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  refresh_token: string;

  @Column("datetime", { nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  refresh_token_expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
