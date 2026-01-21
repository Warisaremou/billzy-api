import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreatePaymentDetailDto {
  @ApiProperty({ example: "Acme Corp" })
  @IsString()
  @IsNotEmpty()
  owner_name: string;

  @ApiProperty({ example: "FR00 1234 5678 9012 3456 7890 1234" })
  @IsString()
  @IsNotEmpty()
  iban: string;

  @ApiProperty({ example: "REVOFRPP" })
  @IsString()
  @IsNotEmpty()
  bic: string;

  @ApiProperty({ example: "Revolut" })
  @IsString()
  @IsNotEmpty()
  bank_name: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  @IsNotEmpty()
  company_id: string;
}
