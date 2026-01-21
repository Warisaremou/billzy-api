import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompaniesModule } from "../companies/companies.module";
import { PaymentDetail } from "./entities/payment_detail.entity";
import { PaymentDetailsController } from "./payment_details.controller";
import { PaymentDetailsService } from "./payment_details.service";

@Module({
  imports: [TypeOrmModule.forFeature([PaymentDetail]), CompaniesModule],
  controllers: [PaymentDetailsController],
  providers: [PaymentDetailsService],
  exports: [PaymentDetailsService],
})
export class PaymentDetailsModule {}
