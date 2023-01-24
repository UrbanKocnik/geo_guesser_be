import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract.service';
import { RoleEnum } from 'src/roles/roles.enum';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService extends AbstractService<User> {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super(usersRepository);
  }

  async findUser(user: User) {
    const found_user = await super.findOne({ id: user.id }, ['role']);
    return {
      data: found_user,
      message: 'Fetched user',
    };
  }

  async updateUser(uid: number, user: User, userDto: UpdateUserDto) {
    const loggedUser = await super.findOne({ id: user.id }, ['role']);
    const editedUser = await super.findOne({ id: uid }, ['role']);
    if (editedUser.id != loggedUser.id) {
      //if stavek preveri ali je tisti ki poskusa editat lastnik ali admin, ce ni nic vrze error
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

    if (userDto.password) {
      if (userDto.old_password) {
        const isValidOldPassword = await bcrypt.compare(
          userDto.old_password,
          editedUser.password,
        );

        if (!isValidOldPassword) {
          throw new HttpException(
            {
              status: HttpStatus.UNPROCESSABLE_ENTITY,
              errors: {
                oldPassword: 'Incorrect old password',
              },
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      } else {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              oldPassword: 'Missing old password',
            },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    if (userDto.password && userDto.password_confirm) {
      if (userDto.password === userDto.password_confirm) {
        const saltOrRounds = 12;
        const password = userDto.password;
        const hashed_pw = await bcrypt.hash(password, saltOrRounds);
        userDto.password = hashed_pw;
      } else {
        return {
          data: null,
          message: 'Password do not match',
        };
      }
    }

    delete userDto.old_password;
    delete userDto.password_confirm;

    await super.update(editedUser.id, userDto);
    const edited_user = await super.findOne(
      {
        id: editedUser.id,
      },
      ['role'],
    );
    return {
      data: edited_user,
      message: 'Edited user info',
    };
  }

  async deleteUser(uid: number, user: User) {
    const loggedUser = await super.findOne({ id: user.id }, ['role']);
    const deletedUser = await super.findOne({ id: uid }, ['role']);
    if (
      deletedUser.id != loggedUser.id &&
      ![RoleEnum.admin].includes(loggedUser.role.id)
    ) {
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
    const deleted_user = await super.findOne({ id: deletedUser.id });
    await super.delete(deletedUser.id);
    return {
      data: deleted_user,
      message: 'Deleted user',
    };
  }
}
