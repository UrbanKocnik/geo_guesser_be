import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class RoleDto {
  @ApiProperty()
  @IsOptional()
  id?: number | null;
  @ApiProperty()
  @IsOptional()
  name?: string | null;
}
