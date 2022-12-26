import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuessesModule } from 'src/guesses/guesses.module';
import { UsersModule } from 'src/users/users.module';
import { Location } from './entity/locations.entity';
import { LocationsController } from './locations.controller';
import { locationsRepository } from './locations.repository';
import { LocationsService } from './locations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Location]), UsersModule, GuessesModule],
  controllers: [LocationsController],
  providers: [LocationsService, locationsRepository],
})
export class LocationsModule {}
