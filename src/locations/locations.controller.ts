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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TransformInterceptor } from 'src/common/response.interceptor';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationsService } from './locations.service';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@ApiTags('locations')
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
    @Query('take') take = 9,
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
  @ApiOperation({
    summary: 'Fetches a random location from the database',
  })
  @SerializeOptions({
    groups: ['exposeProvider'],
  })
  @Get('random')
  async random() {
    return this.locationsService.getRandomLocation();
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Returns logged in user guesses with smallest error distance together with guessed location',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    example: 3,
    description: 'How many guesses you take per page',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'How many pages you want to load (page * take)',
  })
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
  @ApiOperation({
    summary: 'Returns locations added by the user',
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
  @ApiOperation({
    summary: 'Returns all guesses of the location with provided id',
  })
  @Get('guesses/:id')
  async allGuessesOfLocation(
    @Param('id') id: number,
    @Query('page') page = 1,
    @Query('take') take = 13,
    @Query('condition') condition = 'error_distance',
  ) {
    return this.locationsService.getLocationGuesses(id, page, take, condition);
  }

  @ApiOperation({
    summary: 'Returns data of the location with provided id',
  })
  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['exposeProvider'],
  })
  @Get(':id')
  async getLocation(@Param('id') id: number) {
    return this.locationsService.getLocation(id);
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
  public async deleteLocation(@Request() request, @Param('id') id: number) {
    return this.locationsService.deleteLocation(id, request.user);
  }
}
