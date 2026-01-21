import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsUUID } from "class-validator";
import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDataDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  company_id?: string;
}
