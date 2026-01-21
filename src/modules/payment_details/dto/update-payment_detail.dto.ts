import { PartialType } from "@nestjs/swagger";
import { CreatePaymentDetailDto } from "./create-payment_detail.dto";

export class UpdatePaymentDetailDto extends PartialType(CreatePaymentDetailDto) {}
