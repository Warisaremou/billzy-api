import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";

export class AuthForgotPasswordDto {
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
