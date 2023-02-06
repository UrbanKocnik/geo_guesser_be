import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Request,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TransformInterceptor } from 'src/common/response.interceptor';
import { CreateLogArrayDto } from './dto/create-log-array.dto';
import { LoggerService } from './logger.service';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@Controller('logger')
export class LoggerController {
  constructor(private loggerService: LoggerService) {}

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['exposeProvider'],
  })
  @Get('all')
  async all(
    @Request() request,
    @Query('page') page = 1,
    @Query('take') take = 100,
    @Query('condition') condition = 'createdAt',
  ) {
    return this.loggerService.getLogs(page, take, condition, request.user);
  }

  @ApiBearerAuth()
  @Post('add')
  async create(@Request() request, @Body() loggerDto: CreateLogArrayDto) {
    return this.loggerService.createLogEntries(request.user, loggerDto);
  }
}
