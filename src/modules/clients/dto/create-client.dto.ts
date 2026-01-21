import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateClientDto {
  @ApiProperty({ example: "Acme Corporation" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: "12345678901234" })
  @IsNotEmpty()
  @IsString()
  siret: string;

  @ApiProperty({ example: "FR12345678901" })
  @IsNotEmpty()
  @IsString()
  tva_number: string;

  @ApiProperty({ example: "+33123456789" })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: "123 Main St" })
  @IsNotEmpty()
  @IsString()
  address_street: string;

  @ApiProperty({ example: "75001" })
  @IsNotEmpty()
  @IsString()
  address_zipcode: string;

  @ApiProperty({ example: "Paris" })
  @IsNotEmpty()
  @IsString()
  address_city: string;

  @ApiProperty({ example: "France" })
  @IsNotEmpty()
  @IsString()
  address_country: string;

  @ApiProperty({ example: "https://example.com/logo.png" })
  @IsString()
  @IsOptional()
  logo_url?: string;
}
