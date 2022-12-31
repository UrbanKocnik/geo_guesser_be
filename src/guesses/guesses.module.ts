import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Guess } from './entity/guesses.entity';
import { GuessesController } from './guesses.controller';
import { GuessesService } from './guesses.service';

@Module({
  imports: [TypeOrmModule.forFeature([Guess]), forwardRef(() => UsersModule)],
  controllers: [GuessesController],
  providers: [GuessesService],
  exports: [GuessesService],
})
export class GuessesModule {}
