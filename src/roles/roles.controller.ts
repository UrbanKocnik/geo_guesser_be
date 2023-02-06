import {
  Body,
  ClassSerializerInterceptor,
  Request,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  Query,
  SerializeOptions,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransformInterceptor } from 'src/common/response.interceptor';
import { RolesService } from './roles.service';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['exposeProvider'],
  })
  @Get('get/all')
  async all(
    @Request() request,
    @Query('page') page = 1,
    @Query('take') take = 2,
  ) {
    return this.rolesService.getRoles(request.user, page, take);
  }

  @ApiBearerAuth()
  @Post('add')
  async create(@Request() request, @Body('name') name: string) {
    return this.rolesService.addRole(request.user, name);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['exposeProvider'],
  })
  @Get('get/:id')
  async get(@Request() request, @Param('id') id: number) {
    return this.rolesService.getRole(request.user, id);
  }

  @ApiBearerAuth()
  @Patch('edit/:id')
  async update(
    @Request() request,
    @Param('id') id: number,
    @Body('name') name: string,
  ) {
    return await this.rolesService.editRole(request.user, id, name);
  }

  @ApiBearerAuth()
  @Delete('delete/:id')
  async delete(@Request() request, @Param('id') id: number) {
    return this.rolesService.deleteRole(request.user, id);
  }
}
