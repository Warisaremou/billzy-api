import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseArrayPipe,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { CreateInvoiceItemDto } from "./dto/create-invoice-item.dto";
import { UpdateInvoiceItemDto } from "./dto/update-invoice-item.dto";
import { InvoiceItemsService } from "./invoice-items.service";

@ApiBearerAuth()
@ApiTags("Invoice Items")
@Controller("invoice-items")
export class InvoiceItemsController {
  constructor(private readonly invoiceItemsService: InvoiceItemsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: [CreateInvoiceItemDto] })
  addInvoiceItems(
    @Body(new ParseArrayPipe({ items: CreateInvoiceItemDto }))
    items: CreateInvoiceItemDto[],
  ) {
    return this.invoiceItemsService.addInvoiceItems(items);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllInvoiceItems() {
    return this.invoiceItemsService.getAllInvoiceItems();
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  getInvoiceItemById(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.invoiceItemsService.getInvoiceItemById(id);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  updateInvoiceItem(@Param("id", new ParseUUIDPipe()) id: string, @Body() updateInvoiceItemDto: UpdateInvoiceItemDto) {
    return this.invoiceItemsService.updateInvoiceItem(id, updateInvoiceItemDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  removeInvoiceItem(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.invoiceItemsService.removeInvoiceItem(id);
  }
}
