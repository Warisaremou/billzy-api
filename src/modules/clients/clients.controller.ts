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
import { PERMISSIONS } from "../../lib/constants/permissions";
import { RequirePermissions } from "../../lib/decorators/permissions.decorator";
import { Roles } from "../../lib/decorators/roles.decorator";
import { PermissionsGuard } from "../../lib/guards/permissions.guard";
import { RolesGuard } from "../../lib/guards/roles.guard";
import { UserRole } from "../roles/role.enum";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";

@ApiCookieAuth()
@UseGuards(RolesGuard)
@UseGuards(PermissionsGuard)
@ApiTags("Clients")
@Controller("clients")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post("/:companyId")
  @RequirePermissions(PERMISSIONS.CLIENTS_CREATE)
  addClient(@Param("companyId", new ParseUUIDPipe()) companyId: string, @Body() createClientDto: CreateClientDto) {
    return this.clientsService.addClient(companyId, createClientDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SUPER_ADMIN)
  getAllClients() {
    return this.clientsService.getAllClients();
  }

  @Get("/company/company-clients")
  @RequirePermissions(PERMISSIONS.CLIENTS_VIEW)
  getCompanyClients(@Request() req) {
    return this.clientsService.getCompanyClients(req.user.companies[0]!);
  }

  @Get(":companyId/clients")
  @RequirePermissions(PERMISSIONS.CLIENTS_VIEW)
  getClientsByCompany(@Param("companyId", new ParseUUIDPipe()) companyId: string) {
    return this.clientsService.getClientsByCompany(companyId);
  }

  @Get(":id")
  getClient(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.clientsService.getClient(id);
  }

  @Patch(":id")
  updateClient(@Param("id", new ParseUUIDPipe()) id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.updateClient(id, updateClientDto);
  }

  @Delete(":id")
  removeClient(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.clientsService.removeClient(id);
  }
}
