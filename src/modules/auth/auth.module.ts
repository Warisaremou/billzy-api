import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { MailModule } from "../mail/mail.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AccountActivationService } from "./services/account-activation.service";
import { AuthService } from "./services/auth.service";
import { OtpService } from "./services/otp.service";
import { PasswordResetService } from "./services/password-reset.service";
import { TokenService } from "./services/token.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>("AUTH_JWT_SECRET") || process.env.AUTH_JWT_SECRET!,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, OtpService, PasswordResetService, AccountActivationService, JwtStrategy],
})
export class AuthModule {}
