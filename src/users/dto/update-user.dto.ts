import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, MinLength} from 'class-validator';

export class UpdateUserDto {
  @Transform(({ value }) => value?.toLowerCase().trim())

  @IsOptional()
  @MinLength(6)
  password?: string | null;

  @IsOptional()
  @MinLength(6)
  old_password?: string | null;

  @IsOptional()
  first_name?: string | null;

  @IsOptional()
  last_name?: string | null;

  @IsOptional()
  @MinLength(6)
  profile_image?: string | null;
}
