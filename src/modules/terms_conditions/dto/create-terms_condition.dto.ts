import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTermsConditionDto {
  @ApiProperty({ example: "Termes et Conditions Générales" })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "ID de la société associée aux termes et conditions",
  })
  @IsNotEmpty()
  @IsString()
  company_id: string;
}
