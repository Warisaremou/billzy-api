import { createKeyv } from "@keyv/redis";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource, type DataSourceOptions } from "typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CONFIGS } from "./config";
import { TypeOrmConfigService } from "./database/typeorm-config.service";
import { CACHE_EXPIRATION_TIME } from "./lib/constants";
import { JwtAuthGuard } from "./lib/guards/jwt-auth.guard";
import { LoggingInterceptor } from "./lib/interceptors/logging.interceptor";
import { AuthModule } from "./modules/auth/auth.module";
import { ClientsModule } from "./modules/clients/clients.module";
import { CompaniesModule } from "./modules/companies/companies.module";
import { FilesModule } from "./modules/files/files.module";
import { InvoiceItemsModule } from "./modules/invoice-items/invoice-items.module";
import { InvoiceModule } from "./modules/invoice/invoice.module";
import { MailModule } from "./modules/mail/mail.module";
import { PaymentDetailsModule } from "./modules/payment_details/payment_details.module";
import { TermsConditionsModule } from "./modules/terms_conditions/terms_conditions.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: CONFIGS,
      envFilePath: [process.env.NODE_ENV === "test" ? `.env.test` : ".env"],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: CACHE_EXPIRATION_TIME,
      useFactory: async (configService: ConfigService) => {
        return {
          stores: [
            createKeyv({
              username: configService.get("cache.redis.username"),
              password: configService.get("cache.redis.password"),
              socket: {
                host: configService.get("cache.redis.host"),
                port: configService.get("cache.redis.port"),
              },
            }),
          ],
        };
      },
    }),
    MailModule,
    UsersModule,
    AuthModule,
    CompaniesModule,
    ClientsModule,
    InvoiceItemsModule,
    FilesModule,
    InvoiceModule,
    PaymentDetailsModule,
    TermsConditionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
