import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { forwardRef, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity.js";
import { ACCOUNT_ACTIVATION_EXPIRATION, AUTH_ERRORS } from "../../lib/constants";
import { RequestResponseMessage } from "../../lib/types/index.js";
import { generateUrlToken } from "../../utils";
import { CompaniesService } from "../companies/companies.service";
import { Company } from "../companies/entities/company.entity";
import { MailService } from "../mail/mail.service";
import { Role } from "../roles/entities/role.entity";
import { UserRole } from "../roles/role.enum";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDataDto } from "./dto/update-user-data.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @Inject(forwardRef(() => CompaniesService))
    private readonly companiesService: CompaniesService,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  async addCompanyAdminUser(companyId: string, createUserDto: CreateUserDto): Promise<void> {
    const company = await this.companiesService.checkCompanyExists(companyId);
    const adminRole = await this.getRoleByName(UserRole.ADMIN);

    await this.createAccount(createUserDto, adminRole, company);
  }

  async addUserToCompany(companyId: string, createUserDto: CreateUserDto): Promise<void> {
    const company = await this.companiesService.checkCompanyExists(companyId);
    const userRole = await this.getRoleByName(UserRole.USER);

    await this.createAccount(createUserDto, userRole, company);
  }

  private async createAccount(createUserDto: CreateUserDto, role: Role, company: Company): Promise<void> {
    const existingAccount = await this.existingAccount(createUserDto.email);
    if (existingAccount) {
      throw new NotFoundException(AUTH_ERRORS.ACCOUNT_ALREADY_EXISTS);
    }

    const user = await this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        ...createUserDto,
        role: role,
      });

      const savedUser = await manager.save(user);

      await manager.createQueryBuilder().relation(User, "companies").of(savedUser).add(company);

      return savedUser;
    });

    await this.sendActivationEmail(user);
    this.logger.log(`${role.name} account created: ${user.id} for company: ${company.id}`);
  }

  private async sendActivationEmail(user: User): Promise<void> {
    const activationToken = generateUrlToken();

    await this.updatePasswordResetHash(user.id, activationToken);

    const cacheKey = this.getActivationCacheKey(user.id);
    await this.cacheService.set(cacheKey, activationToken, ACCOUNT_ACTIVATION_EXPIRATION);

    await this.mailService.sendAccountActivationEmail(user, activationToken);
    this.logger.log(`Activation email sent to user: ${user.id}`);
  }

  getActivationCacheKey(userId: string): string {
    return `account_activation_${userId}`;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.dataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .leftJoinAndSelect("user.companies", "companies")
      .where("role.name != :roleName", { roleName: UserRole.SUPER_ADMIN })
      .getMany();
    return users;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ["role"],
    });

    if (!user) {
      throw new NotFoundException(AUTH_ERRORS.ACCOUNT_NOT_FOUND);
    }
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDataDto): Promise<RequestResponseMessage> {
    await this.getUserById(id);

    await this.usersRepository.update(id, updateUserDto as QueryDeepPartialEntity<User>);
    this.logger.log(`User updated: ${id}`);
    return { message: "User updated successfully" };
  }

  async getUserProfile(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ["role"],
    });

    if (!user) {
      throw new NotFoundException(AUTH_ERRORS.ACCOUNT_NOT_FOUND);
    }

    return user;
  }

  async updateProfile<T>(id: string, updateUserDto: T): Promise<RequestResponseMessage> {
    await this.getUserById(id);

    await this.usersRepository.update(id, updateUserDto as QueryDeepPartialEntity<User>);
    this.logger.log(`User profile updated: ${id}`);
    return { message: "Profile updated successfully" };
  }

  async revokeAccess(id: string): Promise<RequestResponseMessage> {
    await this.getUserById(id);
    await this.usersRepository.update(id, { is_active: false });

    this.logger.log(`User access revoked: ${id}`);
    return { message: "User access revoked successfully" };
  }

  async deleteAccount(id: string): Promise<RequestResponseMessage> {
    const user = await this.getUserById(id);
    await this.usersRepository.softRemove(user);

    this.logger.log(`User deleted: ${id}`);
    return { message: "User deleted successfully" };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ["role"],
    });
  }

  async getUserByHash(hash: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { hash } });
  }

  async updateRefreshToken(
    id: string,
    data: { refresh_token: string | null; refresh_token_expires_at: Date | null },
  ): Promise<void> {
    await this.usersRepository.update(id, data as QueryDeepPartialEntity<User>);
  }

  async updatePasswordResetHash(id: string, hash: string | null): Promise<void> {
    await this.usersRepository.update(id, { hash } as QueryDeepPartialEntity<User>);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.usersRepository.update(id, { password: hashedPassword } as QueryDeepPartialEntity<User>);
  }

  async activateAccount(id: string): Promise<void> {
    await this.usersRepository.update(id, { is_active: true } as QueryDeepPartialEntity<User>);
  }

  private async getRoleByName(roleName: UserRole): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { name: roleName } });

    if (!role) {
      this.logger.error(`Role not found: ${roleName}`);
      throw new NotFoundException(`Role ${roleName} not found`);
    }

    return role;
  }

  private existingAccount(email: string): Promise<boolean> {
    return this.usersRepository.createQueryBuilder("user").where("user.email = :email", { email }).getExists();
  }
}
