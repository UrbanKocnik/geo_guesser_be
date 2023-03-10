import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateGuessDto {
  @ApiProperty()
  @IsOptional()
  name?: string | null;

  @ApiProperty()
  @IsOptional()
  error_distance?: number | null;

  @ApiProperty()
  @IsOptional()
  long?: number | null;

  @ApiProperty()
  @IsOptional()
  lat?: number | null;
}
