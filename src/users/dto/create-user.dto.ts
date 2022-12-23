import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  Validate,
} from 'class-validator';

export class CreateUserDto {
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty()
  @IsEmail()
  email: string | null;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  first_name: string

  @IsOptional()
  last_name: string

  @IsOptional()
  profile_image: string;

  hash?: string | null;
}
