import { PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

class Payload {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  first_name?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  last_name?: string;
}

export class UpdateUserDto extends PartialType(Payload) {}
