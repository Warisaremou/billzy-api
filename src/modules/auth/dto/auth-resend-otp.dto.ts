import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";

export class AuthResendOtpDto {
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
