import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AUTH_ERRORS, CACHE_EXPIRATION_TIME } from "../../../lib/constants";
import { MailService } from "../../../modules/mail/mail.service";
import { UsersService } from "../../../modules/users/users.service";
import { generateHash, generateUrlToken } from "../../../utils";

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.getUserByEmail(email);
    if (!user || !user.is_active) {
      throw new NotFoundException(AUTH_ERRORS.ACCOUNT_NOT_FOUND);
    }

    const resetToken = generateUrlToken();

    await this.usersService.updatePasswordResetHash(user.id, resetToken);

    const cacheKey = this.getResetCacheKey(user.id);
    await this.cacheService.set(cacheKey, resetToken, CACHE_EXPIRATION_TIME * 2);

    await this.mailService.sendResetPasswordEmail(user, resetToken);
    this.logger.log(`Password reset initiated: ${user.id}`);
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    const user = await this.usersService.getUserByHash(resetToken);

    if (!user || !user.is_active) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_RESET_LINK);
    }

    const cacheKey = this.getResetCacheKey(user.id);
    const cachedToken = await this.cacheService.get<string>(cacheKey);

    if (!cachedToken || cachedToken !== resetToken) {
      this.logger.warn(`Invalid reset token: ${user.id}`);
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_RESET_LINK);
    }

    const isSamePassword = await this.isSamePassword(newPassword, user.password);
    if (isSamePassword) {
      throw new UnauthorizedException(AUTH_ERRORS.SAME_PASSWORD_POLICY_VIOLATION);
    }

    const newHashedPassword = await generateHash(newPassword);
    await this.usersService.updatePassword(user.id, newHashedPassword);
    await this.usersService.updatePasswordResetHash(user.id, null);

    await this.cacheService.del(cacheKey);
    this.logger.log(`Password reset completed: ${user.id}`);
  }

  private async isSamePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private getResetCacheKey(userId: string): string {
    return `reset_password_${userId}`;
  }
}
