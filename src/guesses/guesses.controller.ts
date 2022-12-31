import {
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  Request,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TransformInterceptor } from 'src/common/response.interceptor';
import { CreateGuessDto } from './dto/create-guess.dto';
import { GuessesService } from './guesses.service';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@Controller('guesses')
export class GuessesController {
  constructor(private guessesService: GuessesService) {}

  @ApiBearerAuth()
  @Post('add')
  async create(@Request() request, @Body() guessDto: CreateGuessDto) {
    return this.guessesService.createGuess(request.user, guessDto);
  }
}
