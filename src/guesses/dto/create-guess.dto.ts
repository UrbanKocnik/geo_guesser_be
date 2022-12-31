import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Location } from 'src/locations/entity/locations.entity';

export class CreateGuessDto {
  @ApiProperty({ example: 'Jezero Bled' })
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  error_distance: number;

  @ApiProperty()
  @IsNotEmpty()
  coordinates: string;

  @ApiProperty()
  @IsNotEmpty()
  location: Location;
}
