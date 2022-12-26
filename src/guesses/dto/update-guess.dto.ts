import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateGuessDto {
  @ApiProperty({ example: 'Jezero Bled' })
  @IsOptional()
  name?: string | null;

  @ApiProperty()
  @IsOptional()
  error_distance?: number | null;

  @ApiProperty()
  @IsOptional()
  coordinates?: string | null;
}
