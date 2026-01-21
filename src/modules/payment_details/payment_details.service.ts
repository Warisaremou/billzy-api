import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { CompaniesService } from "../companies/companies.service";
import { CreatePaymentDetailDto } from "./dto/create-payment_detail.dto";
import { UpdatePaymentDetailDto } from "./dto/update-payment_detail.dto";
import { PaymentDetail } from "./entities/payment_detail.entity";

@Injectable()
export class PaymentDetailsService {
  private readonly logger = new Logger(PaymentDetailsService.name);

  constructor(
    @InjectRepository(PaymentDetail)
    private readonly paymentDetailsRepository: Repository<PaymentDetail>,
    private readonly companiesService: CompaniesService,
  ) {}

  async create(createPaymentDetailDto: CreatePaymentDetailDto): Promise<PaymentDetail> {
    const { company_id, ...paymentDetailData } = createPaymentDetailDto;

    await this.companiesService.checkCompanyExists(company_id);
    const exitingPaymentDetails = await this.paymentDetailsRepository.findOne({
      where: {
        company: { id: company_id },
        iban: paymentDetailData.iban,
        bic: paymentDetailData.bic,
      },
    });

    if (exitingPaymentDetails) {
      throw new ConflictException("Payment details with this IBAN or BIC already exists for the company");
    }

    const paymentDetail = this.paymentDetailsRepository.create({
      ...paymentDetailData,
      company: { id: company_id } as any,
    });

    return await this.paymentDetailsRepository.save(paymentDetail);
  }

  async findAll(): Promise<PaymentDetail[]> {
    return await this.paymentDetailsRepository.find({
      relations: ["company"],
    });
  }

  async findOne(id: string): Promise<PaymentDetail> {
    const paymentDetail = await this.paymentDetailsRepository.findOne({
      where: { id },
      relations: ["company"],
    });

    if (!paymentDetail) {
      throw new NotFoundException(`Payment details not found`);
    }

    return paymentDetail;
  }

  async findByCompany(companyId: string): Promise<PaymentDetail[]> {
    return await this.paymentDetailsRepository.find({
      where: {
        company: { id: companyId },
      },
      relations: ["company"],
    });
  }

  async update(id: string, updatePaymentDetailDto: UpdatePaymentDetailDto): Promise<PaymentDetail> {
    const paymentDetail = await this.findOne(id);

    if (!paymentDetail) {
      throw new NotFoundException(`Payment details not found`);
    }

    const { company_id, ...updateData } = updatePaymentDetailDto;

    if (updateData.iban || updateData.bic) {
      await this.checkExistingPaymentDetail(
        company_id || paymentDetail.company.id,
        updateData.iban,
        updateData.bic,
        id,
      );
    }

    if (company_id) {
      paymentDetail.company = { id: company_id } as any;
    }

    Object.assign(paymentDetail, updateData);

    const updatedPaymentDetail = await this.paymentDetailsRepository.save(paymentDetail);
    this.logger.log(`Payment detail updated: ${id}`);
    return updatedPaymentDetail;
  }

  async remove(id: string): Promise<void> {
    const paymentDetail = await this.findOne(id);
    await this.paymentDetailsRepository.remove(paymentDetail);
  }

  async checkExistingPaymentDetail(
    company_id: string | undefined,
    iban: string | undefined,
    bic: string | undefined,
    excludeId?: string,
  ): Promise<void> {
    const paymentDetail = await this.paymentDetailsRepository.findOne({
      where: {
        company: { id: company_id },
        iban,
        bic,
      },
    });

    if (paymentDetail && paymentDetail.id !== excludeId) {
      throw new ConflictException("Payment details with this IBAN or BIC already exists for the company");
    }
  }
}
