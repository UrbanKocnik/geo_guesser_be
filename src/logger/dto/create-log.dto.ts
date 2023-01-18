import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLogDto {
  @ApiProperty()
  @IsNotEmpty()
  action: string;

  @ApiProperty()
  @IsOptional()
  component_type?: string | null;

  @ApiProperty()
  @IsOptional()
  new_value?: string | null;

  @ApiProperty()
  @IsNotEmpty()
  url: string;

  @ApiProperty()
  @IsNotEmpty()
  action_date: Date;
}
