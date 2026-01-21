import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Req, Request, Res } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import type { Request as ExpressRequest, Response } from "express";
import {
  ACCESS_COOKIE_CONFIG,
  ACCESS_TOKEN_COOKIE,
  REFRESH_COOKIE_CONFIG,
  REFRESH_TOKEN_COOKIE,
} from "../../lib/constants";
import { Public } from "../../lib/decorators/public.decorator";
import { UpdateUserDto } from "../users/dto/update-user.dto";
import { AuthActivateAccountDto } from "./dto/auth-activate-account.dto";
import { AuthForgotPasswordDto } from "./dto/auth-forgot-password.dto";
import { AuthLoginConfirmDto } from "./dto/auth-login-confirm.dto";
import { AuthLoginDto } from "./dto/auth-login.dto";
import { AuthResendOtpDto } from "./dto/auth-resend-otp.dto";
import { AuthResetPasswordDto } from "./dto/auth-reset-password.dto";
import { AuthService } from "./services/auth.service";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.CREATED)
  async login(@Body() signInDto: AuthLoginDto) {
    return this.authService.login(signInDto);
  }

  @Public()
  @Post("login/confirm")
  @HttpCode(HttpStatus.CREATED)
  async confirmUserLogin(@Body() signInDto: AuthLoginConfirmDto, @Res({ passthrough: true }) res: Response) {
    const { token, refresh_token } = await this.authService.loginConfirm(signInDto);

    // Set both tokens as httpOnly cookies
    res.cookie(ACCESS_TOKEN_COOKIE, token, ACCESS_COOKIE_CONFIG);
    res.cookie(REFRESH_TOKEN_COOKIE, refresh_token, REFRESH_COOKIE_CONFIG);

    return { message: "Login successfully" };
  }

  @Public()
  @Post("activate-account")
  @HttpCode(HttpStatus.OK)
  async activateAccount(@Body() activateAccountDto: AuthActivateAccountDto) {
    return this.authService.activateAccount(activateAccountDto);
  }

  @Public()
  @Post("resend-otp")
  @HttpCode(HttpStatus.CREATED)
  async resendLoginOtp(@Body() resendOtpDto: AuthResendOtpDto) {
    return this.authService.resendLoginOtp(resendOtpDto.email);
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(HttpStatus.CREATED)
  async forgotPassword(@Body() forgotPasswordDto: AuthForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.CREATED)
  async resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: ExpressRequest, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
    const tokens = await this.authService.refreshAccessToken(refreshToken);

    // Set new cookies
    res.cookie(ACCESS_TOKEN_COOKIE, tokens.access_token, ACCESS_COOKIE_CONFIG);
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refresh_token, REFRESH_COOKIE_CONFIG);

    return { message: "Tokens refreshed successfully" };
  }

  @ApiCookieAuth()
  @Get("me")
  @HttpCode(HttpStatus.OK)
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }

  @ApiCookieAuth()
  @Patch("me")
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateProfile(req.user.sub, updateUserDto);
  }

  @ApiCookieAuth()
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.sub);

    // Clear both tokens
    res.clearCookie(ACCESS_TOKEN_COOKIE);
    res.clearCookie(REFRESH_TOKEN_COOKIE);

    return { message: "Logged out successfully" };
  }
}
