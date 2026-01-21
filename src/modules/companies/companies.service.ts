import { ForbiddenException, forwardRef, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { UserRole } from "../roles/role.enum";
import { TermsConditionsService } from "../terms_conditions/terms_conditions.service";
import { UsersService } from "../users/users.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { UserContext } from "./dto/user-context.dto";
import { Company } from "./entities/company.entity";

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => TermsConditionsService))
    private readonly termsConditionsService: TermsConditionsService,
  ) {}

  async addCompany(createCompanyDto: CreateCompanyDto): Promise<Company> {
    await this.checkCompanyExistsWithSiret(createCompanyDto.siret);

    const company = this.companiesRepository.create(createCompanyDto);
    const savedCompany = await this.companiesRepository.save(company);
    this.logger.log(`Company created: ${savedCompany.id}`);

    const defaultTermsContent = "Conditions générales par défaut";

    await this.termsConditionsService.create({
      content: defaultTermsContent,
      company_id: savedCompany.id,
    });

    this.logger.log(`Default terms and conditions set for company: ${savedCompany.id}`);
    return savedCompany;
  }

  async getAllCompanies(): Promise<Company[]> {
    return await this.companiesRepository.find();
  }

  async getUserCompanies(userCompanies: string[]): Promise<Company[]> {
    return await this.companiesRepository.find({
      where: {
        id: In(userCompanies),
      },
    });
  }

  async getCompany(userContext: UserContext, companyId: string): Promise<Company> {
    const company = await this.checkCompanyExists(companyId);

    await this.checkUserHasAccessToCompany(userContext, companyId);
    return company;
  }

  async getCompanyRelatedInfo(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id },
      relations: ["terms_condition", "invoices"],
    });

    if (!company) {
      throw new NotFoundException(`Company not found`);
    }

    return company;
  }

  async getCompanyUsers(userContext: UserContext, companyId: string) {
    const company = await this.checkCompanyExists(companyId);

    await this.checkUserHasAccessToCompany(userContext, companyId);
    return company.users;
  }

  async updateCompany(userContext: UserContext, id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.companiesRepository.preload({
      id,
      ...updateCompanyDto,
    });

    if (!company) {
      throw new NotFoundException(`Company not found`);
    }

    await this.checkUserHasAccessToCompany(userContext, id);

    return await this.companiesRepository.save(company);
  }

  async removeCompany(id: string) {
    await this.checkCompanyExists(id);
    const result = await this.companiesRepository.delete(id);
    this.logger.log(`Company deleted: ${id}`);
    return result;
  }

  async checkCompanyExists(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOneBy({ id });

    if (!company) {
      throw new NotFoundException(`Company not found`);
    }
    return company;
  }

  private async checkCompanyExistsWithSiret(siret: string): Promise<void> {
    const existingCompany = await this.companiesRepository.findOneBy({ siret });

    if (existingCompany) {
      throw new NotFoundException(`Company with SIRET already exists`);
    }
  }

  private async checkUserHasAccessToCompany(userContext: UserContext, companyId: string): Promise<void> {
    const { userCompanies, userId } = userContext;

    const user = await this.usersService.getUserById(userId);

    if (user.role.name === UserRole.SUPER_ADMIN) {
      return;
    }

    if (!userCompanies.includes(companyId)) {
      throw new ForbiddenException("You do not have access to this resource");
    }
  }
}
