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
  Request,
  Res,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { type Response } from "express";
import { Roles } from "../../lib/decorators/roles.decorator";
import { RolesGuard } from "../../lib/guards/roles.guard";
import { UserContext } from "../companies/dto/user-context.dto";
import { UserRole } from "../roles/role.enum";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { InvoicePaymentStatusDto } from "./dto/invoice-payment-status.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { InvoiceService } from "./invoice.service";

@ApiCookieAuth()
@UseGuards(RolesGuard)
@ApiTags("Invoices")
@Controller("invoices")
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post("/company/:companyId")
  @HttpCode(HttpStatus.CREATED)
  addInvoice(@Param("companyId", new ParseUUIDPipe()) companyId: string, @Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.addInvoice(companyId, createInvoiceDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SUPER_ADMIN)
  getAllInvoices() {
    return this.invoiceService.getAllInvoices();
  }

  @Get("/company/invoices")
  @HttpCode(HttpStatus.OK)
  getCompanyGeneratedInvoices(@Request() req) {
    const userContext = new UserContext(req.user.sub, req.user.companies);

    return this.invoiceService.getCompanyGeneratedInvoices(userContext.userCompanies[0]!);
  }

  @Get("/:id")
  @HttpCode(HttpStatus.OK)
  getInvoice(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.invoiceService.getInvoice(id);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  updateInvoice(@Param("id", new ParseUUIDPipe()) id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoiceService.updateInvoice(id, updateInvoiceDto);
  }

  @Patch(":id/payment-status")
  @HttpCode(HttpStatus.OK)
  updateInvoicePaymentStatus(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() invoicePaymentStatusDto: InvoicePaymentStatusDto,
  ) {
    return this.invoiceService.updateInvoicePaymentStatus(id, invoicePaymentStatusDto.paymentStatus);
  }

  @Post(":id/items")
  @HttpCode(HttpStatus.CREATED)
  async addItemsToInvoice(@Param("id", new ParseUUIDPipe()) id: string, @Body() body: { itemIds: string[] }) {
    return this.invoiceService.addItemsToInvoice(id, body.itemIds);
  }

  @Delete(":id/items/:itemId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItemFromInvoice(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Param("itemId", new ParseUUIDPipe()) itemId: string,
  ) {
    return this.invoiceService.removeItemFromInvoice(id, itemId);
  }

  @Post(":id/publish")
  @HttpCode(HttpStatus.OK)
  publishInvoice(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.invoiceService.publishInvoice(id);
  }

  @Post(":id/download")
  @HttpCode(HttpStatus.OK)
  async downloadInvoicePdf(@Param("id", new ParseUUIDPipe()) id: string, @Res({ passthrough: true }) res: Response) {
    const { invoiceRef, pdfBuffer } = await this.invoiceService.downloadInvoicePdf(id);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="facture_${invoiceRef}.pdf"`,
    });

    return new StreamableFile(pdfBuffer);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteInvoice(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.invoiceService.deleteInvoice(id);
  }
}
