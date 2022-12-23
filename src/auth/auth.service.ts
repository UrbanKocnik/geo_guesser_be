import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import * as crypto from 'crypto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { AuthUpdateDto } from './dto/auth-update.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
      ) {}

    async validateLogin(
        loginDto: AuthEmailLoginDto,
        onlyAdmin: boolean,
      ): Promise<{ token: string; user: User }> {
        const user = await this.usersService.findOne({
          email: loginDto.email,
        });
    
        if (!user) {
          throw new HttpException(
            {
              status: HttpStatus.UNPROCESSABLE_ENTITY,
              errors: {
                email: 'notFound',
              },
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
    
        const isValidPassword = await bcrypt.compare(
          loginDto.password,
          user.password,
        );
    
        if (isValidPassword) {
          const payload = { id: user.id, email: loginDto.email };

          const token = await this.jwtService.sign(payload);
    
          return { token, user: user };
        } else {
          throw new HttpException(
            {
              status: HttpStatus.UNPROCESSABLE_ENTITY,
              errors: {
                password: 'incorrectPassword',
              },
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }

    async register(dto: AuthRegisterLoginDto): Promise<void> {
    const hash = crypto
        .createHash('sha256')
        .update(randomStringGenerator())
        .digest('hex');

        const user = await this.usersService.findOne({
          email: dto.email,
        });
    
        if (user) {
          throw new HttpException(
            {
              status: HttpStatus.UNPROCESSABLE_ENTITY,
              errors: {
                email: 'alreadyExists',
              },
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
        else{
          const saltOrRounds = 12;
          const password = dto.password;
          const hashed_pw = await bcrypt.hash(password, saltOrRounds);          
          dto.password = hashed_pw;
          
          await this.usersService.create({
            ...dto,
            email: dto.email,
            hash
          });
        }
    }
    async update(user: User, userDto: AuthUpdateDto): Promise<User> {
      if (userDto.password) {
        if (userDto.oldPassword) {
          const currentUser = await this.usersService.findOne({
            id: user.id,
          });
  
          const isValidOldPassword = await bcrypt.compare(
            userDto.oldPassword,
            currentUser.password,
          );
  
          if (!isValidOldPassword) {
            throw new HttpException(
              {
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                  oldPassword: 'incorrectOldPassword',
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
                oldPassword: 'missingOldPassword',
              },
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }

      const saltOrRounds = 12;
      const password = userDto.password;
      const hashed_pw = await bcrypt.hash(password, saltOrRounds);          
      userDto.password = hashed_pw;
  
      await this.usersService.update(user.id, userDto);
  
      return this.usersService.findOne({
        id: user.id,
      });
    }

    async me(user: User): Promise<User> {
      return this.usersService.findOne({
        id: user.id,
      });
    }
  
    async delete(user: User): Promise<void> {
      await this.usersService.delete(user.id);
    }
}
