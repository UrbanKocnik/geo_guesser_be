import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  Request,
  Query,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TransformInterceptor } from 'src/common/response.interceptor';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationsService } from './locations.service';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@Controller('locations')
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['exposeProvider'],
  })
  @Get('all')
  async all(
    @Query('page') page = 1,
    @Query('take') take = 2,
    @Query('condition') condition = 'createdAt',
  ) {
    return this.locationsService.getLocations(page, take, condition);
  }

  @ApiBearerAuth()
  @Post('add')
  async create(@Request() request, @Body() locationDto: CreateLocationDto) {
    return this.locationsService.createLocation(request.user, locationDto);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['exposeProvider'],
  })
  @Get('random')
  async random() {
    return this.locationsService.getRandomLocation();
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['exposeProvider'],
  })
  @Get('best')
  async bestGuesses(
    @Request() request,
    @Query('page') page = 1,
    @Query('take') take = 3,
    @Query('condition') condition = 'error_distance',
  ) {
    return this.locationsService.getUserLocationGuesses(
      request.user,
      page,
      take,
      condition,
      'ASC',
    );
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['exposeProvider'],
  })
  @Get('guesses/user')
  async userGuesses(
    @Request() request,
    @Query('page') page = 1,
    @Query('take') take = 3,
    @Query('condition') condition = 'createdAt',
  ) {
    return this.locationsService.getUserLocationGuesses(
      request.user,
      page,
      take,
      condition,
      'DESC',
    );
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['exposeProvider'],
  })
  @Get('user')
  async userLocations(
    @Request() request,
    @Query('page') page = 1,
    @Query('take') take = 4,
    @Query('condition') condition = 'createdAt',
  ) {
    return this.locationsService.getUserLocations(
      request.user,
      page,
      take,
      condition,
      'DESC',
    );
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['exposeProvider'],
  })
  @Get(':id')
  async allGuessesOfLocation(
    @Param('id') id: number,
    @Query('page') page = 1,
    @Query('take') take = 13,
    @Query('condition') condition = 'error_distance',
  ) {
    return this.locationsService.getLocationGuesses(id, page, take, condition);
  }

  @ApiBearerAuth()
  @Patch(':id')
  public async updateLocation(
    @Request() request,
    @Body() locationDto: UpdateLocationDto,
    @Param('id') id: number,
  ) {
    return this.locationsService.updateLocation(request.user, id, locationDto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  public async deleteBox(@Request() request, @Param('id') id: number) {
    return this.locationsService.deleteLocation(id, request.user);
  }
}
