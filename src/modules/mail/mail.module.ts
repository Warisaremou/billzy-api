import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";
import { MailService } from "./mail.service";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          port: configService.get("mail.port"),
          host: configService.get("mail.host"),
          ignoreTLS: configService.get("mail.ignoreTLS"),
          requireTLS: configService.get("mail.requireTLS"),
          secure: configService.get("mail.secure"),
          auth: {
            user: configService.get("mail.user"),
            pass: configService.get("mail.password"),
          },
        },
        defaults: {
          from: `"${configService.get("mail.defaultSenderName")}" <${configService.get("mail.defaultEmailSender")}>`,
        },
        template: {
          dir: join(__dirname, "templates"),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
