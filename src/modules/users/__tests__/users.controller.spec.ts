import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateUserDto } from "../dto/create-user.dto";
import { UsersController } from "../users.controller";
import { UsersService } from "../users.service";

describe("UsersController", () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            addCompanyAdminUser: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersController = module.get<UsersController>(UsersController);
  });

  describe("addCompanyAdminUser", () => {
    const companyId = "company-id-123";
    const createUserDto: CreateUserDto = {
      email: "admin@example.com",
      first_name: "Admin",
      last_name: "User",
    };

    it("should call usersService.addCompanyAdminUser with correct parameters", async () => {
      await usersController.addCompanyAdminUser(companyId, createUserDto);
      expect(usersService.addCompanyAdminUser).toHaveBeenCalledWith(companyId, createUserDto);
      expect(usersService.addCompanyAdminUser).toHaveBeenCalledTimes(1);
    });

    it("should return void", async () => {
      const result = await usersController.addCompanyAdminUser(companyId, createUserDto);
      expect(result).toBeUndefined();
    });

    it("should handle errors thrown by usersService.addCompanyAdminUser", async () => {
      (usersService.addCompanyAdminUser as jest.Mock).mockRejectedValueOnce(new Error("Service error"));

      await expect(usersController.addCompanyAdminUser(companyId, createUserDto)).rejects.toThrow("Service error");
    });

    it("should return BadRequestException for invalid input", async () => {
      const invalidCreateUserDto: any = {
        email: "not-an-email",
        first_name: "",
        last_name: "User",
      };

      try {
        await usersController.addCompanyAdminUser(companyId, invalidCreateUserDto);
      } catch (error) {
        expect(error.status).toBe(BadRequestException);
        expect(usersService.addCompanyAdminUser).not.toHaveBeenCalled();
      }
    });
  });
});
