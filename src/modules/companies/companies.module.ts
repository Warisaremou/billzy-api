import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TermsConditionsModule } from "../terms_conditions/terms_conditions.module";
import { UsersModule } from "../users/users.module";
import { CompaniesController } from "./companies.controller";
import { CompaniesService } from "./companies.service";
import { Company } from "./entities/company.entity";

@Module({
  imports: [
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([Company]),
    forwardRef(() => TermsConditionsModule),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
