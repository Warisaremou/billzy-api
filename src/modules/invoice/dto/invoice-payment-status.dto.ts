import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { InvoicePaymentStatus } from "../../../lib/types";

export class InvoicePaymentStatusDto {
  @ApiProperty({
    example: "payée",
    description: "Statut de paiement de la facture",
  })
  @IsNotEmpty()
  @IsEnum(InvoicePaymentStatus)
  paymentStatus: InvoicePaymentStatus;
}
