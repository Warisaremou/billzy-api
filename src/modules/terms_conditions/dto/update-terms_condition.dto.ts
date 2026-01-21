import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

class contentDto {
  @ApiProperty({ example: "Termes et Conditions Générales" })
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class UpdateTermsConditionDto extends PartialType(contentDto) {}
