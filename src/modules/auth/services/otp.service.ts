import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { AUTH_ERRORS, CACHE_EXPIRATION_TIME } from "../../../lib/constants.js";
import { generateOTP } from "../../../utils/index.js";
import { MailService } from "../../mail/mail.service.js";
import { User } from "../../users/entities/user.entity.js";

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  async generateAndSendOtp(user: User): Promise<void> {
    const otp = generateOTP();

    const cacheKey = this.getOtpCacheKey(user.id);
    await this.cacheService.set(cacheKey, otp, CACHE_EXPIRATION_TIME);

    await this.mailService.sendLoginOtp(user.email, otp);
    this.logger.log(`OTP sent to user: ${user.id}`);
  }

  async verifyOtp(userId: string, otp: string): Promise<void> {
    const cacheKey = this.getOtpCacheKey(userId);
    const cachedOtp = await this.cacheService.get<string>(cacheKey);

    if (!cachedOtp || cachedOtp !== otp) {
      this.logger.warn(`Invalid OTP attempt: ${userId}`);
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_OTP);
    }

    await this.cacheService.del(cacheKey);
  }

  private getOtpCacheKey(userId: string): string {
    return `login_otp_${userId}`;
  }
}
