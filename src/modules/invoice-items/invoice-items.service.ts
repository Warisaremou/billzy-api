import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Invoice } from "../invoice/entities/invoice.entity";
import { CreateInvoiceItemDto } from "./dto/create-invoice-item.dto";
import { UpdateInvoiceItemDto } from "./dto/update-invoice-item.dto";
import { InvoiceItem } from "./entities/invoice-item.entity";

@Injectable()
export class InvoiceItemsService {
  private readonly logger = new Logger(InvoiceItemsService.name);

  constructor(
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
  ) {}

  async addInvoiceItems(items: CreateInvoiceItemDto[]): Promise<string[]> {
    const invoiceItems = this.invoiceItemRepository.create(items);
    const savedInvoiceItem = await this.invoiceItemRepository.save(invoiceItems);

    this.logger.log(`Invoice Items created: ${savedInvoiceItem.map((item) => item.id).join(", ")}`);
    return savedInvoiceItem.map((item) => item.id);
  }

  async getAllInvoiceItems(): Promise<InvoiceItem[]> {
    return await this.invoiceItemRepository.find();
  }

  async getInvoiceItemById(id: string): Promise<InvoiceItem> {
    return this.findEntity(id);
  }

  async updateInvoiceItem(id: string, updateInvoiceItemDto: UpdateInvoiceItemDto): Promise<InvoiceItem> {
    await this.findEntity(id);

    const invoiceItem = await this.invoiceItemRepository.preload({
      id,
      ...updateInvoiceItemDto,
    });

    const updatedItem = await this.invoiceItemRepository.save(invoiceItem!);
    this.logger.log(`Invoice Item updated: ${id}`);
    return updatedItem;
  }

  async attachItemToInvoice(id: string, invoice: Invoice): Promise<InvoiceItem> {
    const invoiceItem = await this.findEntity(id);

    invoiceItem.invoice = invoice;

    return await this.invoiceItemRepository.save(invoiceItem);
  }

  async removeInvoiceItem(id: string): Promise<InvoiceItem> {
    const invoiceItem = await this.findEntity(id);

    const deletedInvoiceItem = await this.invoiceItemRepository.remove(invoiceItem);

    this.logger.log(`Invoice Item deleted: ${id}`);
    return deletedInvoiceItem;
  }

  private async findEntity(id: string): Promise<InvoiceItem> {
    const invoiceItem = await this.invoiceItemRepository.findOne({ where: { id } });

    if (!invoiceItem) {
      throw new NotFoundException(`Invoice Item with ID ${id} not found`);
    }

    return invoiceItem;
  }
}
