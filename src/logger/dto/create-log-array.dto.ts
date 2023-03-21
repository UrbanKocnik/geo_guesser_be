import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Log } from '../entity/logger.entity';

export class CreateLogArrayDto {
  @ApiProperty({
    type: [Log],
  })
  @IsNotEmpty()
  logs: Log[];
}
