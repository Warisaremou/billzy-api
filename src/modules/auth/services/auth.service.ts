import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AUTH_ERRORS } from "../../../lib/constants.js";
import { RequestResponseMessage } from "../../../lib/types/index.js";
import { User } from "../../../modules/users/entities/user.entity.js";
import { UpdateUserDto } from "../../users/dto/update-user.dto.js";
import { UsersService } from "../../users/users.service.js";
import { AuthActivateAccountDto } from "../dto/auth-activate-account.dto.js";
import { AuthLoginConfirmDto } from "../dto/auth-login-confirm.dto.js";
import { AuthLoginResponseDto } from "../dto/auth-login-response.dto.js";
import { AuthLoginDto } from "../dto/auth-login.dto.js";
import { AuthResetPasswordDto } from "../dto/auth-reset-password.dto.js";
import { TokensDto } from "../dto/tokens.dto.js";
import { AccountActivationService } from "./account-activation.service.js";
import { OtpService } from "./otp.service.js";
import { PasswordResetService } from "./password-reset.service.js";
import { TokenService } from "./token.service.js";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
    private readonly passwordResetService: PasswordResetService,
    private readonly accountActivationService: AccountActivationService,
  ) {}

  async validateUser(loginDto: AuthLoginDto): Promise<User> {
    const user = await this.checkUserAccount(loginDto.email);

    const isPasswordMatching = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordMatching) {
      this.logger.warn(`Invalid password for user: ${user.id}`);
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    return user;
  }

  async login(loginDto: AuthLoginDto): Promise<void> {
    const user = await this.validateUser(loginDto);
    await this.otpService.generateAndSendOtp(user);
  }

  async loginConfirm(loginConfirmDto: AuthLoginConfirmDto): Promise<AuthLoginResponseDto> {
    const user = await this.checkUserAccount(loginConfirmDto.email);

    await this.otpService.verifyOtp(user.id, loginConfirmDto.otp);
    const tokens = await this.tokenService.generateTokens(user);

    this.logger.log(`User logged in: ${user.id}`);
    return {
      token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  async resendLoginOtp(email: string): Promise<void> {
    const user = await this.checkUserAccount(email);
    await this.otpService.generateAndSendOtp(user);
  }

  async forgotPassword(email: string): Promise<void> {
    await this.passwordResetService.forgotPassword(email);
  }

  async activateAccount(activateAccountDto: AuthActivateAccountDto): Promise<RequestResponseMessage> {
    await this.accountActivationService.activateAccount(activateAccountDto.token, activateAccountDto.password);
    return {
      message: "Account activated successfully",
    };
  }

  async resetPassword(resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    await this.passwordResetService.resetPassword(resetPasswordDto.hash, resetPasswordDto.newPassword);
  }

  async refreshAccessToken(refreshToken: string): Promise<TokensDto> {
    const user = await this.tokenService.verifyRefreshToken(refreshToken);
    const tokens = await this.tokenService.generateTokens(user);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.tokenService.invalidateRefreshToken(userId);
    this.logger.log(`User logged out: ${userId}`);
  }

  async getProfile(id: string): Promise<User> {
    return await this.usersService.getUserProfile(id);
  }

  async updateProfile(id: string, updateUserDto: UpdateUserDto): Promise<RequestResponseMessage> {
    return await this.usersService.updateProfile<UpdateUserDto>(id, updateUserDto);
  }

  private async checkUserAccount(email: string): Promise<User> {
    const userAccount = await this.usersService.getUserByEmail(email);
    if (!userAccount) {
      this.logger.warn(`Account not found`);
      throw new UnauthorizedException(AUTH_ERRORS.ACCOUNT_NOT_FOUND);
    }

    if (!userAccount.is_active) {
      this.logger.warn(`Deactivated account access attempt: ${userAccount.id}`);
      throw new UnauthorizedException(AUTH_ERRORS.ACCOUNT_DEACTIVATED);
    }

    return userAccount;
  }
}
