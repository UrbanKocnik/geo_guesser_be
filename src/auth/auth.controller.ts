import { Body, ClassSerializerInterceptor, Controller, Delete, HttpCode, HttpStatus, Patch, Post, UseGuards, UseInterceptors, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
    constructor(public service: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    public async login(@Body() loginDto: AuthEmailLoginDto) {
      return this.service.validateLogin(loginDto);
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() createUserDto: AuthRegisterLoginDto) {
      return this.service.register(createUserDto);
    }               

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    public async me(@Request() request) {
      return this.service.me(request.user);
    }
    
    @Patch('me')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    public async update(@Request() request, @Body() userDto: AuthUpdateDto) {
      return this.service.update(request.user, userDto);
    }

    @Delete('me')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    public async delete(@Request() request) {
      return this.service.delete(request.user);
    }

    @Post('forgot/password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() forgotPasswordDto: AuthForgotPasswordDto) {
      return this.service.forgotPassword(forgotPasswordDto.email);
    }

    @Post('reset/password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto) {
      return this.service.resetPassword(
        resetPasswordDto.hash,
        resetPasswordDto.password,
      );
    }
  }
