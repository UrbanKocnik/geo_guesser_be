import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, MinLength} from 'class-validator';

export class UpdateUserDto {
  @Transform(({ value }) => value?.toLowerCase().trim())

  @ApiProperty()
  @IsOptional()
  @MinLength(6)
  password?: string | null;

  @ApiProperty()
  @IsOptional()
  @MinLength(6)
  old_password?: string | null;

  @ApiProperty({ example: 'John' })
  @IsOptional()
  first_name?: string | null;

  @ApiProperty({ example: 'Doe' })
  @IsOptional()
  last_name?: string | null;

  @ApiProperty({ type: () => String })
  @IsOptional()
  @MinLength(6)
  profile_image?: string | null;
}
