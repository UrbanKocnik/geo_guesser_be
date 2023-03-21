import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { RoleDto } from './dto/role.dto';
import { Role } from './entity/roles.entity';
import { RoleEnum } from './roles.enum';

@Injectable()
export class RolesService extends AbstractService<Role> {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private usersService: UsersService,
  ) {
    super(roleRepository);
  }

  async getUser(id: number): Promise<User> {
    return await this.usersService.findOne({ id }, ['role']);
  }

  async getRoles(user: User, page: number, take: number) {
    const loggedUser = await this.getUser(user.id);
    if (![RoleEnum.admin].includes(loggedUser.role.id)) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          errors: {
            error: 'Operation unauthorized',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const roles = await super.paginate(page, take);
    return {
      message: 'Roles fetched',
      data: roles,
    };
  }
  async addRole(user: User, dto: RoleDto) {
    const loggedUser = await this.getUser(user.id);
    if (![RoleEnum.admin].includes(loggedUser.role.id)) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          errors: {
            error: 'Operation unauthorized',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const role = await super.create({ name: dto.name });
    return {
      message: 'Role created',
      data: role,
    };
  }

  async getRole(user: User, id: number) {
    const loggedUser = await this.getUser(user.id);
    if (![RoleEnum.admin].includes(loggedUser.role.id)) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          errors: {
            error: 'Operation unauthorized',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const role = await super.findOne({ id });
    return {
      message: 'Role fetched',
      data: role,
    };
  }

  async editRole(user: User, id: number, dto: RoleDto) {
    const loggedUser = await this.getUser(user.id);
    if (![RoleEnum.admin].includes(loggedUser.role.id)) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          errors: {
            error: 'Operation unauthorized',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    await super.update(id, { name: dto.name });
    const role = await super.findOne({ id });
    return {
      message: 'Role edited',
      data: role,
    };
  }

  async deleteRole(user: User, id: number) {
    const loggedUser = await this.getUser(user.id);
    if (![RoleEnum.admin].includes(loggedUser.role.id)) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          errors: {
            error: 'Operation unauthorized',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const role = await super.findOne({ id });
    await super.delete(id);
    return {
      message: 'Role deleted',
      data: role,
    };
  }
}
