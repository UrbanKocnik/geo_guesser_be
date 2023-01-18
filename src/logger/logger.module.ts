import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerController } from './logger.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Log } from './entity/logger.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Log]), UsersModule],
  providers: [LoggerService],
  controllers: [LoggerController],
})
export class LoggerModule {}
