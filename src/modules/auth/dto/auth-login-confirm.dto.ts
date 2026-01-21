import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class AuthLoginConfirmDto {
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}
