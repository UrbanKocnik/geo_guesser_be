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
import { RoleEnum } from 'src/roles/roles.enum';
import { MailService } from 'src/mail/mail.service';
import { ForgotService } from 'src/forgot/forgot.service';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
        private forgotService: ForgotService,
        private mailService: MailService 
      ) {}

    async validateLogin(
        loginDto: AuthEmailLoginDto
      ){
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
    
          return { 
            message: "Successfully logged in",
            data: {token, user: user }
          }
        } 
        else {
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

    async register(dto: AuthRegisterLoginDto) {
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
          
          const created_user = await this.usersService.create({
            email: dto.email,
            password: dto.password,
            role: RoleEnum.user,
            hash
          });

          return{
            message: "User registered",
            data: created_user
          }
        }        
    }

  async forgotPassword(email: string){
    const user = await this.usersService.findOne({
      email,
    });

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailNotExists',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    } else {
      const hash = crypto
        .createHash('sha256')
        .update(randomStringGenerator())
        .digest('hex');
      await this.forgotService.create({
        hash,
        user,
      });

      await this.mailService.forgotPassword({
        to: email,
        hash
      });
      return{
        message: "Forgot password email sent",
        data: email
      }
    }
  }

  async resetPassword(hash: string, password: string) {
    const forgot = await this.forgotService.findOne({
      where: {
        hash,
      },
    });

    if (!forgot) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hash: `notFound`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const saltOrRounds = 12;
    const hashed_pw = await bcrypt.hash(password, saltOrRounds);          
    const user = forgot.user;
    user.password = hashed_pw;
    await user.save();
    await this.forgotService.softDelete(forgot.id);

    return{
      message: "Password reset",
      data: user
    }
  }

  async update(user: User, userDto: AuthUpdateDto) {  
    return await this.usersService.updateUser(user.id, user, userDto);
  }

  async me(user: User) {
    return this.usersService.findUser(user);
  }

  async delete(user: User) {
    return await this.usersService.deleteUser(user.id, user);
  }
}
