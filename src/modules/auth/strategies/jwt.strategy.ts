import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { JwtPayload } from "../../../lib/types/index";
import { UsersService } from "../../../modules/users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT]),
      ignoreExpiration: false,
      secretOrKey: process.env.AUTH_JWT_SECRET!,
    });
  }

  private static extractJWT(req: Request): string | null {
    if (req.cookies && "access_token" in req.cookies) {
      return req.cookies.access_token;
    }
    return null;
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.usersService.getUserById(payload.sub);
    if (!user) throw new UnauthorizedException();

    return payload;
  }
}
