import { IsNotEmpty, IsOptional, MinLength} from 'class-validator';

export class AuthUpdateDto {

  @IsOptional()
  @IsNotEmpty()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  oldPassword: string;
}
