import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateLocationDto {
  @ApiProperty({ example: 'Jezero Bled' })
  @IsOptional()
  name?: string | null;

  @ApiProperty()
  @IsOptional()
  image?: string | null;

  @ApiProperty()
  @IsOptional()
  coordinates?: string | null;

  @ApiProperty()
  @IsOptional()
  long?: number | null;

  @ApiProperty()
  @IsOptional()
  lat?: number | null;
}
