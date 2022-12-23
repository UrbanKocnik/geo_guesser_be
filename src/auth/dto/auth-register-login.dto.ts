import { IsEmail, IsNotEmpty, MinLength, Validate } from 'class-validator';
import { Transform } from 'class-transformer';

export class AuthRegisterLoginDto {
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @MinLength(6)
  password: string;
}
