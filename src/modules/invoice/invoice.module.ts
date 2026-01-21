import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientsModule } from "../clients/clients.module";
import { CompaniesModule } from "../companies/companies.module";
import { FilesModule } from "../files/files.module";
import { InvoiceItemsModule } from "../invoice-items/invoice-items.module";
import { PaymentDetailsModule } from "../payment_details/payment_details.module";
import { Invoice } from "./entities/invoice.entity";
import { InvoiceController } from "./invoice.controller";
import { InvoiceService } from "./invoice.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice]),
    InvoiceItemsModule,
    ClientsModule,
    CompaniesModule,
    PaymentDetailsModule,
    FilesModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
