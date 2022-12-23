import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, MinLength} from 'class-validator';

export class UpdateUserDto {
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @MinLength(6)
  password?: string;
}
