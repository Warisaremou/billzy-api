import { IsOptional, IsString } from "class-validator";

export class UpdatePasswordResetDto {
  @IsOptional()
  @IsString()
  hash?: string | null;
}
