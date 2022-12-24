
import { IsNotEmpty, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AuthEmailLoginDto {
  @ApiProperty({ example: 'test1@example.com' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;
  
  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
