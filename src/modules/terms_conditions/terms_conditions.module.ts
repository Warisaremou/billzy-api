import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompaniesModule } from "../companies/companies.module";
import { TermsCondition } from "./entities/terms_condition.entity";
import { TermsConditionsController } from "./terms_conditions.controller";
import { TermsConditionsService } from "./terms_conditions.service";

@Module({
  imports: [TypeOrmModule.forFeature([TermsCondition]), forwardRef(() => CompaniesModule)],
  controllers: [TermsConditionsController],
  providers: [TermsConditionsService],
  exports: [TermsConditionsService],
})
export class TermsConditionsModule {}
