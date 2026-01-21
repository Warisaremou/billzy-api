import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompaniesModule } from "../companies/companies.module";
import { MailModule } from "../mail/mail.module";
import { Role } from "../roles/entities/role.entity";
import { User } from "./entities/user.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [forwardRef(() => CompaniesModule), MailModule, TypeOrmModule.forFeature([Role, User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
