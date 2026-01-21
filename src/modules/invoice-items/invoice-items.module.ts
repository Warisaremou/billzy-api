import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InvoiceItem } from "./entities/invoice-item.entity";
import { InvoiceItemsController } from "./invoice-items.controller";
import { InvoiceItemsService } from "./invoice-items.service";

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceItem])],
  controllers: [InvoiceItemsController],
  providers: [InvoiceItemsService],
  exports: [InvoiceItemsService],
})
export class InvoiceItemsModule {}
