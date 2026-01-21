import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateInvoiceItemDto {
  @ApiProperty({
    example: "Location de voiture",
    description: "Libellé de la ligne de facture",
  })
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty({
    example: "rouge",
    description: "Description détaillée",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 3,
    description: "Quantité (nombre entier)",
    default: 1,
  })
  @IsNotEmpty()
  @IsInt({ message: "La quantité doit être un nombre entier" })
  @Min(1, { message: "La quantité minimum est de 1" })
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    example: 117.91,
    description: "Prix unitaire",
  })
  @IsNotEmpty()
  @IsNumber({}, { message: "Le prix doit être un nombre" })
  @Min(0)
  @Type(() => Number)
  unit_price: number;

  @ApiProperty({
    example: 20.0,
    description: "Taux de TVA (en %)",
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  vat_rate?: number;
}
