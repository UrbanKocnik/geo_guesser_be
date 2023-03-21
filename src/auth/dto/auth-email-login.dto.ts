import { IsNotEmpty, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AuthEmailLoginDto {
  @ApiProperty({ example: 'urban.kocnik@gmail.com' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'secret' })
  @IsNotEmpty()
  password: string;
}
