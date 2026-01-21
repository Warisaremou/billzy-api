import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { User } from "../users/entities/user.entity";

@Injectable()
export class MailService {
  private readonly appName: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.appName = this.configService.get("app.name")!;
  }

  async sendLoginOtp(userEmail: string, otp: string) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: "Votre code de vérification à usage unique",
      template: "./login-confirmation",
      context: {
        otp,
        expiresIn: "15 minutes",
      },
    });
  }

  async sendResetPasswordEmail(user: User, resetToken: string) {
    const resetLink = `${this.configService.get("app.frontendDomain")}/auth/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: "Votre demande de réinitialisation de mot de passe",
      template: "./reset-password",
      context: {
        resetLink,
        userFullName: `${user.first_name} ${user.last_name}`,
        expiresIn: "30 minutes",
      },
    });
  }

  async sendAccountActivationEmail(user: User, activationToken: string) {
    const activationLink = `${this.configService.get("app.frontendDomain")}/auth/activate-account?token=${activationToken}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: `${this.appName} : Bienvenue ! Veuillez finaliser votre inscription`,
      template: "./account-activation",
      context: {
        activationLink,
        userFullName: `${user.first_name} ${user.last_name}`,
        expiresIn: "24 hours",
      },
    });
  }
}
