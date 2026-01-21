import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { AUTH_ERRORS } from "../../../lib/constants.js";
import { generateHash } from "../../../utils/index.js";
import { UsersService } from "../../users/users.service.js";

@Injectable()
export class AccountActivationService {
  private readonly logger = new Logger(AccountActivationService.name);

  constructor(
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  async activateAccount(activationToken: string, password: string): Promise<void> {
    const user = await this.usersService.getUserByHash(activationToken);

    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_ACTIVATION_LINK);
    }

    if (user.is_active) {
      throw new UnauthorizedException("Account is already activated");
    }

    const cacheKey = this.usersService.getActivationCacheKey(user.id);
    const cachedToken = await this.cacheService.get<string>(cacheKey);

    if (!cachedToken || cachedToken !== activationToken) {
      this.logger.warn(`Invalid activation token: ${user.id}`);
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_ACTIVATION_LINK);
    }

    const hashedPassword = await generateHash(password);
    await this.usersService.updatePassword(user.id, hashedPassword);
    await this.usersService.activateAccount(user.id);
    await this.usersService.updatePasswordResetHash(user.id, null);

    await this.cacheService.del(cacheKey);
    this.logger.log(`Account activated: ${user.id}`);
  }
}
