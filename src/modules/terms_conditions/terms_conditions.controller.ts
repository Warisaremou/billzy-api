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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../lib/decorators/roles.decorator";
import { RolesGuard } from "../../lib/guards/roles.guard";
import { UserRole } from "../roles/role.enum";
import { CreateTermsConditionDto } from "./dto/create-terms_condition.dto";
import { UpdateTermsConditionDto } from "./dto/update-terms_condition.dto";
import { TermsConditionsService } from "./terms_conditions.service";

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags("Terms & Conditions")
@Controller("terms-conditions")
export class TermsConditionsController {
  constructor(private readonly termsConditionsService: TermsConditionsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTermsConditionDto: CreateTermsConditionDto) {
    return this.termsConditionsService.create(createTermsConditionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.termsConditionsService.findAll();
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  findById(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.termsConditionsService.findById(id);
  }

  @Get("company/:companyId")
  @HttpCode(HttpStatus.OK)
  findByCompanyId(@Param("companyId", new ParseUUIDPipe()) companyId: string) {
    return this.termsConditionsService.findByCompanyId(companyId);
  }

  @Patch("company/:companyId")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(
    @Param("companyId", new ParseUUIDPipe()) companyId: string,
    @Body() updateTermsConditionDto: UpdateTermsConditionDto,
  ) {
    return this.termsConditionsService.update(companyId, updateTermsConditionDto);
  }

  @Delete(":id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.termsConditionsService.remove(id);
  }
}
