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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransformInterceptor } from 'src/common/response.interceptor';
import { RolesService } from './roles.service';
import { RoleDto } from './dto/role.dto';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@Controller('roles')
@ApiTags('roles')
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
  async create(@Request() request, @Body() dto: RoleDto) {
    return this.rolesService.addRole(request.user, dto);
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
    @Body() dto: RoleDto,
  ) {
    return await this.rolesService.editRole(request.user, id, dto);
  }

  @ApiBearerAuth()
  @Delete('delete/:id')
  async delete(@Request() request, @Param('id') id: number) {
    return this.rolesService.deleteRole(request.user, id);
  }
}
