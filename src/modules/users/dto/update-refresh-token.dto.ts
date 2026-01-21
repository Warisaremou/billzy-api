import { IsDate, IsOptional, IsString, ValidateIf } from "class-validator";

export class UpdateRefreshTokenDto {
  @IsOptional()
  @IsString()
  refresh_token?: string | null;

  @ValidateIf((o) => o.refresh_token_expires_at !== null)
  @IsDate()
  @IsOptional()
  refresh_token_expires_at?: Date | null;
}
