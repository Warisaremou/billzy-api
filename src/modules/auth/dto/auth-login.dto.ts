import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";

export class AuthLoginDto {
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
