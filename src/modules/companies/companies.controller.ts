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
  UseGuards,
} from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../lib/decorators/roles.decorator";
import { RolesGuard } from "../../lib/guards/roles.guard";
import { UserRole } from "../roles/role.enum";
import { CompaniesService } from "./companies.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { UserContext } from "./dto/user-context.dto";

@ApiCookieAuth()
@UseGuards(RolesGuard)
@ApiTags("Companies")
@Controller("companies")
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  addCompany(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.addCompany(createCompanyDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SUPER_ADMIN)
  getAllCompanies() {
    return this.companiesService.getAllCompanies();
  }

  @Get("/user/companies")
  @HttpCode(HttpStatus.OK)
  getUserCompanies(@Request() req) {
    return this.companiesService.getUserCompanies(req.user.companies);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  getCompany(@Request() req, @Param("id", new ParseUUIDPipe()) id: string) {
    const userContext = new UserContext(req.user.sub, req.user.companies);
    return this.companiesService.getCompany(userContext, id);
  }

  @Get(":id/users")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getCompanyUsers(@Request() req, @Param("id", new ParseUUIDPipe()) id: string) {
    const userContext = new UserContext(req.user.sub, req.user.companies);
    return this.companiesService.getCompanyUsers(userContext, id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch(":id")
  updateCompany(
    @Request() req,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    const userContext = new UserContext(req.user.sub, req.user.companies);
    return this.companiesService.updateCompany(userContext, id, updateCompanyDto);
  }

  @Delete(":id")
  @Roles(UserRole.SUPER_ADMIN)
  removeCompany(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.companiesService.removeCompany(id);
  }
}
