import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ example: 'Jezero Bled' })
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  image: string;

  @ApiProperty()
  @IsOptional()
  long: number;

  @ApiProperty()
  @IsOptional()
  lat: number;
}
