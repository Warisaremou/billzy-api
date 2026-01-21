import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { InvoicePaymentStatus, InvoiceStatus } from "../../lib/types";
import { ClientsService } from "../clients/clients.service";
import { CompaniesService } from "../companies/companies.service";
import { PdfService } from "../files/pdf.service";
import { InvoiceItem } from "../invoice-items/entities/invoice-item.entity";
import { InvoiceItemsService } from "../invoice-items/invoice-items.service";
import { PaymentDetailsService } from "../payment_details/payment_details.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { Invoice } from "./entities/invoice.entity";

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly invoiceItemsService: InvoiceItemsService,
    private readonly clientsService: ClientsService,
    private readonly companiesService: CompaniesService,
    private readonly pdfService: PdfService,
    private readonly paymentDetailsService: PaymentDetailsService,
  ) {}

  async addInvoice(company_id: string, createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const { items, client_id, ...invoiceData } = createInvoiceDto;

    await this.companiesService.checkCompanyExists(company_id);
    const client = await this.clientsService.clientExists(client_id);

    const clientCompanies = await client.companies;
    const isClientAssociatedWithCompany = clientCompanies.some((company) => company.id === company_id);

    if (!isClientAssociatedWithCompany) {
      throw new BadRequestException(
        `Client is not associated with this company. Please use a client that belongs to company ${company_id}`,
      );
    }

    return await this.invoiceRepository.manager.transaction(async (transactionalEntityManager) => {
      const newInvoice = this.invoiceRepository.create({
        ...invoiceData,
        company: { id: company_id },
        client: { id: client_id },
        total_ht: 0,
        total_vat: 0,
        total_ttc: 0,
      });
      const savedInvoice = await transactionalEntityManager.save(newInvoice);

      // Attach all items within the transaction
      for (const itemId of items) {
        const item = await this.invoiceItemsService.getInvoiceItemById(itemId);
        item.invoice = savedInvoice;
        await transactionalEntityManager.save(item);
      }

      // Reload invoice with items and calculate totals
      const invoiceWithItems = await transactionalEntityManager.findOne(Invoice, {
        where: { id: savedInvoice.id },
        relations: ["items"],
      });

      if (invoiceWithItems) {
        const { total_ht, total_vat, total_ttc } = this.calculateTotals(await invoiceWithItems.items);
        invoiceWithItems.total_ht = total_ht;
        invoiceWithItems.total_vat = total_vat;
        invoiceWithItems.total_ttc = total_ttc;

        const finalInvoice = await transactionalEntityManager.save(invoiceWithItems);
        this.logger.log(`Invoice created: ${finalInvoice.id} for company: ${company_id}`);
        return finalInvoice;
      }

      this.logger.log(`Invoice created: ${savedInvoice.id} for company: ${company_id}`);
      return savedInvoice;
    });
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return await this.invoiceRepository.find({
      relations: ["company", "client"],
    });
  }

  async getCompanyGeneratedInvoices(companyId: string) {
    return await this.invoiceRepository.find({
      where: { company: { id: companyId } },
      relations: ["company", "client"],
    });
  }

  async getInvoice(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ["items", "company", "client"],
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    return invoice;
  }

  // TODO: Refactor function to be cleaner
  async updateInvoice(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({ where: { id }, relations: ["company"] });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    if (invoice.status === InvoiceStatus.PUBLISHED) {
      throw new BadRequestException("Cannot update a published invoice");
    }

    const { client_id, ...updateData } = updateInvoiceDto;

    if (Object.prototype.hasOwnProperty.call(updateData, "due_date")) {
      (invoice as any).due_date = updateData.due_date;
    }

    if (client_id) {
      const client = await this.clientsService.clientExists(client_id);
      const clientCompanies = await client.companies;
      const isClientAssociatedWithCompany = clientCompanies.some((company) => company.id === invoice.company.id);
      if (!isClientAssociatedWithCompany) {
        throw new BadRequestException(
          `Client is not associated with this company. Please use a client that belongs to company ${invoice.company.id}`,
        );
      }
      (invoice as any).client = { id: client_id };
    }

    const saved = await this.invoiceRepository.save(invoice);
    this.logger.log(`Invoice updated: ${id}`);
    return await this.getInvoice(saved.id);
  }

  async updateInvoicePaymentStatus(id: string, paymentStatus: InvoicePaymentStatus): Promise<void> {
    const invoice = await this.existingInvoice(id);

    invoice.payment_status = paymentStatus;

    await this.invoiceRepository.save(invoice);
    this.logger.log(`Invoice payment status updated: ${id} to ${paymentStatus}`);
  }

  async publishInvoice(id: string): Promise<void> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ["company", "client", "items"],
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException("Invoice already published or not in draft status");
    }

    const company = await this.companiesService.getCompanyRelatedInfo(invoice.company.id);
    if (!company.terms_condition) {
      throw new BadRequestException("Cannot publish invoice: Company terms and conditions not set");
    }
    const companyPaymentDetails = await this.paymentDetailsService.findByCompany(company.id);
    if (companyPaymentDetails.length === 0) {
      throw new BadRequestException("Cannot publish invoice: Company payment details not set");
    }

    invoice.status = InvoiceStatus.PUBLISHED;
    invoice.issue_date = new Date();
    // TODO: Generate PDF and send to bucket/storage

    await this.invoiceRepository.save(invoice);
  }

  async downloadInvoicePdf(id: string): Promise<{
    invoiceRef: string;
    pdfBuffer: Uint8Array<ArrayBufferLike>;
  }> {
    const invoice = await this.invoiceRepository.findOne({ where: { id }, relations: ["company", "client", "items"] });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    const company = await this.companiesService.getCompanyRelatedInfo(invoice.company.id);
    if (!company.terms_condition) {
      throw new BadRequestException("Cannot generate invoice PDF: Company terms and conditions not set");
    }
    const companyPaymentDetails = await this.paymentDetailsService.findByCompany(company.id);
    if (companyPaymentDetails.length === 0) {
      throw new BadRequestException("Cannot generate invoice PDF: Company payment details not set");
    }

    const pdfBuffer = await this.pdfService.generateInvoice(invoice, companyPaymentDetails, company.terms_condition);
    return { invoiceRef: invoice.reference, pdfBuffer };
  }

  async addItemsToInvoice(invoiceId: string, itemIds: string[]): Promise<Invoice> {
    const invoice = await this.getInvoice(invoiceId);
    this.validateInvoiceNotPublished(invoice, "Cannot add items to a published invoice");

    await this.validateItemsNotAlreadyAttached(invoice, itemIds);
    const updatedInvoice = await this.updateInvoiceWithItems(invoiceId, itemIds, invoice);
    this.logger.log(`Items added to invoice: ${invoiceId}, items: ${itemIds.join(", ")}`);
    return updatedInvoice;
  }

  async removeItemFromInvoice(invoiceId: string, itemId: string): Promise<Invoice> {
    const invoice = await this.getInvoice(invoiceId);
    this.validateInvoiceNotPublished(invoice, "Cannot remove items from a published invoice");

    await this.validateItemIsAttached(invoice, itemId);

    const updatedInvoice = await this.updateInvoiceWithItem(invoiceId, itemId, null);
    this.logger.log(`Item removed from invoice: ${invoiceId}, item: ${itemId}`);
    return updatedInvoice;
  }

  async deleteInvoice(id: string) {
    const invoice = await this.existingInvoice(id);

    if (invoice.status === InvoiceStatus.PUBLISHED) {
      throw new BadRequestException("Cannot delete a published invoice");
    }

    const result = await this.invoiceRepository.delete(id);
    this.logger.log(`Invoice deleted: ${id}`);
    return result;
  }

  private async existingInvoice(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({ where: { id } });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    return invoice;
  }

  private validateInvoiceNotPublished(invoice: Invoice, message: string): void {
    if (invoice.status === InvoiceStatus.PUBLISHED) {
      throw new BadRequestException(message);
    }
  }

  private async validateItemsNotAlreadyAttached(invoice: Invoice, itemIds: string[]): Promise<void> {
    const existingItems = await invoice.items;
    const existingItemIds = new Set(existingItems.map((item) => item.id));

    const alreadyAttached = itemIds.filter((id) => existingItemIds.has(id));
    if (alreadyAttached.length > 0) {
      throw new BadRequestException(`Items already attached: ${alreadyAttached.join(", ")}`);
    }
  }

  private async validateItemIsAttached(invoice: Invoice, itemId: string): Promise<void> {
    const existingItems = await invoice.items;
    const itemExists = existingItems.some((item) => item.id === itemId);
    if (!itemExists) {
      throw new BadRequestException("Item not found in this invoice");
    }
  }

  private async updateInvoiceWithItem(
    invoiceId: string,
    itemId: string,
    invoiceToSet: Invoice | null,
  ): Promise<Invoice> {
    return await this.invoiceRepository.manager.transaction(async (manager) => {
      const item = await manager.getRepository(InvoiceItem).findOne({
        where: { id: itemId },
      });

      if (!item) {
        throw new NotFoundException("Item not found");
      }

      item.invoice = invoiceToSet;
      await manager.save(item);

      return this.recalculateAndSaveInvoiceTotals(manager, invoiceId);
    });
  }

  private async updateInvoiceWithItems(
    invoiceId: string,
    itemIds: string[],
    invoiceToSet: Invoice | null,
  ): Promise<Invoice> {
    return await this.invoiceRepository.manager.transaction(async (manager) => {
      for (const itemId of itemIds) {
        const item = await manager.getRepository(InvoiceItem).findOne({
          where: { id: itemId },
        });

        if (!item) {
          throw new NotFoundException(`Item not found: ${itemId}`);
        }

        item.invoice = invoiceToSet;
        await manager.save(item);
      }

      return this.recalculateAndSaveInvoiceTotals(manager, invoiceId);
    });
  }

  private async recalculateAndSaveInvoiceTotals(manager: EntityManager, invoiceId: string): Promise<Invoice> {
    const updatedInvoice = await manager.findOne(Invoice, {
      where: { id: invoiceId },
      relations: ["items"],
    });

    if (!updatedInvoice) {
      throw new NotFoundException("Invoice not found");
    }

    const items = await updatedInvoice.items;
    const { total_ht, total_vat, total_ttc } = this.calculateTotals(items);

    updatedInvoice.total_ht = total_ht;
    updatedInvoice.total_vat = total_vat;
    updatedInvoice.total_ttc = total_ttc;

    return await manager.save(updatedInvoice);
  }

  private calculateTotals(items: InvoiceItem[]): { total_ht: number; total_vat: number; total_ttc: number } {
    let total_ht = 0;
    let total_vat = 0;

    items.forEach((item) => {
      const itemTotal = Number(item.unit_total_ht);
      total_ht += itemTotal;
      total_vat += (itemTotal * Number(item.vat_rate)) / 100;
    });

    return {
      total_ht,
      total_vat,
      total_ttc: total_ht + total_vat,
    };
  }
}
