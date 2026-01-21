import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { JwtPayload } from "src/lib/types/index.js";
import { ACCESS_TOKEN_EXPIRATION, AUTH_ERRORS, REFRESH_TOKEN_EXPIRATION } from "../../../lib/constants.js";
import { generateHash, generateTokenId } from "../../../utils";
import { User } from "../../users/entities/user.entity.js";
import { UsersService } from "../../users/users.service.js";
import { TokensDto } from "../dto/tokens.dto.js";

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async generateTokens(user: User): Promise<TokensDto> {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role.name,
      companies: (await user.companies)?.map((company) => company.id) || [],
    };

    // Generate access token (short-lived)
    const access_token = this.jwtService.sign(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });

    // Generate refresh token (long-lived)
    const refresh_token = this.jwtService.sign(
      {
        sub: payload.sub,
        tokenId: generateTokenId(),
        comp: payload.companies,
      },
      { expiresIn: REFRESH_TOKEN_EXPIRATION },
    );

    // Hash and store refresh token
    const hashedRefreshToken = await generateHash(refresh_token);
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

    await this.usersService.updateRefreshToken(user.id, {
      refresh_token: hashedRefreshToken,
      refresh_token_expires_at: refreshTokenExpiresAt,
    });

    return { access_token, refresh_token };
  }

  async verifyRefreshToken(refreshToken: string): Promise<User> {
    if (!refreshToken) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.AUTH_JWT_SECRET!,
      });

      const user = await this.usersService.getUserById(payload.sub);

      if (!user || !user.refresh_token || !user.refresh_token_expires_at) {
        throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
      }

      const isValidRefreshToken = await bcrypt.compare(refreshToken, user.refresh_token);

      if (!isValidRefreshToken || new Date() > user.refresh_token_expires_at) {
        this.logger.warn(`Invalid refresh token attempt: ${user.id}`);
        throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }
  }

  async invalidateRefreshToken(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, {
      refresh_token: null,
      refresh_token_expires_at: null,
    });
  }
}
