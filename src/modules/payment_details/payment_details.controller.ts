import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../../lib/guards/roles.guard";
import { CreatePaymentDetailDto } from "./dto/create-payment_detail.dto";
import { UpdatePaymentDetailDto } from "./dto/update-payment_detail.dto";
import { PaymentDetail } from "./entities/payment_detail.entity";
import { PaymentDetailsService } from "./payment_details.service";

@ApiCookieAuth()
@UseGuards(RolesGuard)
@ApiTags("Payment Details")
@Controller("payment-details")
export class PaymentDetailsController {
  constructor(private readonly paymentDetailsService: PaymentDetailsService) {}

  @Post()
  create(@Body() createPaymentDetailDto: CreatePaymentDetailDto): Promise<PaymentDetail> {
    return this.paymentDetailsService.create(createPaymentDetailDto);
  }

  @Get()
  findAll(): Promise<PaymentDetail[]> {
    return this.paymentDetailsService.findAll();
  }

  @Get("company/:companyId")
  findByCompany(@Param("companyId", ParseUUIDPipe) companyId: string): Promise<PaymentDetail[]> {
    return this.paymentDetailsService.findByCompany(companyId);
  }

  @Get(":paymentId")
  findOne(@Param("paymentId", ParseUUIDPipe) paymentId: string): Promise<PaymentDetail> {
    return this.paymentDetailsService.findOne(paymentId);
  }

  @Patch(":paymentId")
  update(
    @Param("paymentId", ParseUUIDPipe) paymentId: string,
    @Body() updatePaymentDetailDto: UpdatePaymentDetailDto,
  ): Promise<PaymentDetail> {
    return this.paymentDetailsService.update(paymentId, updatePaymentDetailDto);
  }

  @Delete(":paymentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("paymentId", ParseUUIDPipe) paymentId: string): Promise<void> {
    return this.paymentDetailsService.remove(paymentId);
  }
}
