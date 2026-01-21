import { forwardRef, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm/repository/Repository.js";
import { CompaniesService } from "../companies/companies.service";
import { CreateTermsConditionDto } from "./dto/create-terms_condition.dto";
import { UpdateTermsConditionDto } from "./dto/update-terms_condition.dto";
import { TermsCondition } from "./entities/terms_condition.entity";

@Injectable()
export class TermsConditionsService {
  private readonly logger = new Logger(TermsConditionsService.name);

  constructor(
    @InjectRepository(TermsCondition)
    private readonly termsConditionsRepository: Repository<TermsCondition>,
    @Inject(forwardRef(() => CompaniesService))
    private readonly companiesService: CompaniesService,
  ) {}

  async create(createTermsConditionDto: CreateTermsConditionDto): Promise<TermsCondition> {
    const company = await this.companiesService.checkCompanyExists(createTermsConditionDto.company_id);

    const termsCondition = this.termsConditionsRepository.create({
      ...createTermsConditionDto,
      company,
    });

    const savedTermsCondition = await this.termsConditionsRepository.save(termsCondition);
    this.logger.log(
      `Terms & Conditions created: ${savedTermsCondition.id} for company: ${createTermsConditionDto.company_id}`,
    );
    return savedTermsCondition;
  }

  async findAll(): Promise<TermsCondition[]> {
    return await this.termsConditionsRepository.find();
  }

  async findById(id: string): Promise<TermsCondition> {
    const termsCondition = await this.checkTermsConditionExists(id);
    return termsCondition;
  }

  async findByCompanyId(companyId: string): Promise<TermsCondition[]> {
    return await this.termsConditionsRepository.find({
      where: {
        company: { id: companyId },
      },
    });
  }

  async update(companyId: string, updateTermsConditionDto: UpdateTermsConditionDto): Promise<TermsCondition> {
    const termsConditions = await this.termsConditionsRepository.find({
      where: {
        company: { id: companyId },
      },
    });

    if (!termsConditions || termsConditions.length === 0) {
      this.logger.warn(`Terms & Conditions not found for company: ${companyId}`);
      throw new NotFoundException("Terms & Conditions not found for this company");
    }

    const termsCondition = termsConditions[0]!;

    const updatedTermsCondition = await this.termsConditionsRepository.preload({
      id: termsCondition.id,
      ...updateTermsConditionDto,
    });

    if (!updatedTermsCondition) {
      this.logger.warn(`Failed to update Terms & Conditions for company: ${companyId}`);
      throw new NotFoundException("Failed to update Terms & Conditions");
    }

    const savedTermsCondition = await this.termsConditionsRepository.save(updatedTermsCondition);
    this.logger.log(`Terms & Conditions updated: ${savedTermsCondition.id} for company: ${companyId}`);
    return savedTermsCondition;
  }

  async remove(id: string) {
    const termsCondition = await this.checkTermsConditionExists(id);
    const result = await this.termsConditionsRepository.remove(termsCondition);
    this.logger.log(`Terms & Conditions deleted: ${id}`);
    return result;
  }

  private async checkTermsConditionExists(id: string): Promise<TermsCondition> {
    const termsCondition = await this.termsConditionsRepository.findOne({
      where: { id },
    });

    if (!termsCondition) {
      this.logger.warn(`Terms & Conditions not found: ${id}`);
      throw new NotFoundException("Terms & Conditions not found");
    }

    return termsCondition;
  }
}
