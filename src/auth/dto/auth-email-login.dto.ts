
import { IsNotEmpty, Validate } from 'class-validator';
import { Transform } from 'class-transformer';

export class AuthEmailLoginDto {
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsNotEmpty()
  password: string;
}
