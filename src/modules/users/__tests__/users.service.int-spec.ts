import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { AppModule } from "../../../app.module";
import { CompaniesService } from "../../companies/companies.service";
import { Company } from "../../companies/entities/company.entity";
import { MailService } from "../../mail/mail.service";
import { Role } from "../../roles/entities/role.entity";
import { UserRole } from "../../roles/role.enum";
import { User } from "../entities/user.entity";
import { UsersService } from "../users.service";

describe("Users Service", () => {
  let userService: UsersService;
  let usersRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let companiesService: CompaniesService;
  let dataSource: DataSource;
  let app: TestingModule;
  let mailService: MailService;

  const mockMailService = {
    sendAccountActivationEmail: jest.fn().mockResolvedValue(undefined),
    sendLoginOtp: jest.fn().mockResolvedValue(undefined),
    sendResetPasswordEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mockMailService)
      .compile();

    userService = app.get<UsersService>(UsersService);
    usersRepository = app.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = app.get<Repository<Role>>(getRepositoryToken(Role));
    companiesService = app.get<CompaniesService>(CompaniesService);
    dataSource = app.get<DataSource>(DataSource);
    mailService = app.get<MailService>(MailService);

    app.init();
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
    await app.close();
  });

  describe("addCompanyAdminUser", () => {
    let testCompany: Company;

    beforeAll(async () => {
      const roles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER];

      for (const roleName of roles) {
        const roleExists = await roleRepository.findOne({ where: { name: roleName } });
        if (!roleExists) {
          const role = roleRepository.create({ name: roleName });
          await roleRepository.save(role);
        }
      }

      const savedRoles = await roleRepository.find();
      expect(savedRoles).toHaveLength(3);
    });

    beforeEach(async () => {
      const timestamp = Date.now();
      testCompany = await companiesService.addCompany({
        name: `Test Company ${timestamp}`,
        siret: `${timestamp}`.padStart(14, "0"),
        tva_number: `FR${timestamp}`,
        phone: `+33${timestamp}`.substring(0, 15),
        address_street: "123 Test St",
        address_city: "Test City",
        address_zipcode: "12345",
        address_country: "Test Country",
      });
    });

    afterEach(async () => {
      jest.clearAllMocks();

      if (testCompany?.id) {
        const users = await usersRepository.find({
          where: { companies: { id: testCompany.id } } as any,
        });
        if (users.length > 0) {
          await usersRepository.remove(users);
        }
        await dataSource.getRepository("Company").delete(testCompany.id);
      }
    });

    afterAll(async () => {
      const companies = await companiesService.getAllCompanies();
      if (companies.length > 0) {
        const company = companies[0] as Company;
        await dataSource.getRepository("Company").delete(company.id);
      }
    });

    it("should create an admin user and associate with company", async () => {
      const createUserDto = {
        email: `admin@test.com`,
        first_name: "Admin",
        last_name: "User",
      };

      await userService.addCompanyAdminUser(testCompany.id, createUserDto);

      const createdUser = await usersRepository.findOne({
        where: { email: createUserDto.email },
        relations: { role: true, companies: true },
      });

      expect(createdUser).toBeDefined();
      expect(createdUser?.first_name).toBe(createUserDto.first_name);
      expect(createdUser?.last_name).toBe(createUserDto.last_name);
      expect(createdUser?.email).toBe(createUserDto.email);
      expect(createdUser?.role.name).toBe(UserRole.ADMIN);

      // Await the lazy-loaded companies relation
      const userCompanies = await createdUser!.companies;
      expect(userCompanies).toHaveLength(1);
      expect(userCompanies[0]?.id).toBe(testCompany.id);

      expect(createdUser?.is_active).toBe(false);
      expect(createdUser?.hash).toBeDefined();
    });

    it("should throw NotFoundException if company does not exist", async () => {
      const createUserDto = {
        email: "admin2@test.com",
        first_name: "Admin",
        last_name: "Two",
      };
      const nonExistentCompanyId = "00000000-0000-0000-0000-000000000000";

      await expect(userService.addCompanyAdminUser(nonExistentCompanyId, createUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should send activation email when creating user", async () => {
      const createUserDto = {
        email: "testmail@example.com",
        first_name: "Test",
        last_name: "Mail",
      };

      await userService.addCompanyAdminUser(testCompany.id, createUserDto);

      expect(mockMailService.sendAccountActivationEmail).toHaveBeenCalledTimes(1);
      expect(mockMailService.sendAccountActivationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: createUserDto.email,
          first_name: createUserDto.first_name,
          last_name: createUserDto.last_name,
        }),
        expect.any(String),
      );
    });

    it("should not allow duplicate email addresses", async () => {
      const createUserDto = {
        email: "duplicate@test.com",
        first_name: "Duplicate",
        last_name: "User",
      };

      await userService.addCompanyAdminUser(testCompany.id, createUserDto);

      await expect(userService.addCompanyAdminUser(testCompany.id, createUserDto)).rejects.toThrow(NotFoundException);

      expect(mockMailService.sendAccountActivationEmail).toHaveBeenCalledTimes(1);
    });

    it("should create multiple admin users for the same company", async () => {
      const timestamp = Date.now();
      const createUserDto1 = {
        email: `admin3-${timestamp}@test.com`,
        first_name: "Admin",
        last_name: "Three",
      };
      const createUserDto2 = {
        email: `admin4-${timestamp}@test.com`,
        first_name: "Admin",
        last_name: "Four",
      };

      await userService.addCompanyAdminUser(testCompany.id, createUserDto1);
      await userService.addCompanyAdminUser(testCompany.id, createUserDto2);

      const admin1 = await usersRepository.findOne({
        where: { email: createUserDto1.email },
        relations: { role: true, companies: true },
      });
      const admin2 = await usersRepository.findOne({
        where: { email: createUserDto2.email },
        relations: { role: true, companies: true },
      });

      expect(admin1).toBeDefined();
      expect(admin2).toBeDefined();

      const companies1 = await admin1!.companies;
      const companies2 = await admin2!.companies;

      expect(companies1[0]?.id).toBe(testCompany.id);
      expect(companies2[0]?.id).toBe(testCompany.id);
      expect(admin1?.role.name).toBe(UserRole.ADMIN);
      expect(admin2?.role.name).toBe(UserRole.ADMIN);

      expect(mockMailService.sendAccountActivationEmail).toHaveBeenCalledTimes(2);
    });
  });
});
