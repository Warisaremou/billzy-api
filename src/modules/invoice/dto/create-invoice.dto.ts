import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreateInvoiceDto {
  @ApiProperty({
    example: "2024-02-15",
    description: "Date d'échéance de la facture",
  })
  @IsNotEmpty()
  @IsDateString()
  due_date: string;

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "ID du client associé à la facture",
  })
  @IsNotEmpty()
  @IsString()
  client_id: string;

  @ApiProperty({
    example: ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"],
    description: "Liste des IDs des éléments de la facture",
  })
  @IsNotEmpty()
  @IsString({ each: true })
  items: string[];
}
