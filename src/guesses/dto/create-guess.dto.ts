import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Location } from 'src/locations/entity/locations.entity';

export class CreateGuessDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  error_distance: number;

  @ApiProperty()
  @IsOptional()
  long: number;

  @ApiProperty()
  @IsOptional()
  lat: number;

  @ApiProperty({
    type: Location,
  })
  @IsNotEmpty()
  location: Location;
}
