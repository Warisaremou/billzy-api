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
  UseGuards,
} from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../lib/decorators/roles.decorator";
import { RolesGuard } from "../../lib/guards/roles.guard";
import { UserRole } from "../roles/role.enum";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDataDto } from "./dto/update-user-data.dto";
import { UsersService } from "./users.service";

@ApiCookieAuth()
@UseGuards(RolesGuard)
@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.SUPER_ADMIN)
  @Post("admin/:companyId")
  @HttpCode(HttpStatus.CREATED)
  addCompanyAdminUser(
    @Param("companyId", new ParseUUIDPipe()) companyId: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.addCompanyAdminUser(companyId, createUserDto);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post("/:companyId")
  @HttpCode(HttpStatus.CREATED)
  addUserToCompany(@Param("companyId", new ParseUUIDPipe()) companyId: string, @Body() createUserDto: CreateUserDto) {
    return this.usersService.addUserToCompany(companyId, createUserDto);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  getUserById(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.usersService.getUserById(id);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(":id")
  updateUser(@Param("id", new ParseUUIDPipe()) id: string, @Body() updateUserDto: UpdateUserDataDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(":id/revoke")
  revokeAccess(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.usersService.revokeAccess(id);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Delete(":id")
  deleteAccount(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.usersService.deleteAccount(id);
  }
}
