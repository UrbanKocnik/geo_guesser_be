import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthRegisterLoginDto } from '../src/auth/dto/auth-register-login.dto';
import * as request from 'supertest';
import { AuthEmailLoginDto } from 'src/auth/dto/auth-email-login.dto';
import { AuthForgotPasswordDto } from 'src/auth/dto/auth-forgot-password.dto';

describe('AuthController (E2E)', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const module = await Test.createTestingModule({}).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const authEndpoint = 'http://localhost:4000/api/auth';

  const mockRegisterUser: AuthRegisterLoginDto = {
    email: 'urban12@gmail.com',
    first_name: 'User',
    last_name: 'Last',
    password: 'password123',
    password_confirm: 'password123',
  };

  const mockRegisterUserFail: AuthRegisterLoginDto = {
    email: 'urban1@gmail.com',
    first_name: 'User',
    last_name: 'Last',
    password: 'password123',
    password_confirm: 'password123',
  };

  const mockLoginUser: AuthEmailLoginDto = {
    email: 'urban12@gmail.com',
    password: 'password123',
  };

  const mockResetUser: AuthForgotPasswordDto = {
    email: 'urban.forgot@gmail.com',
  };

  let userToken = null;
  let hash = null;

  describe('Register (POST) /auth/register fail', () => {
    it('should fail to create a user and return message email exists', () => {
      return request(`${authEndpoint}`)
        .post('/register')
        .set('Accept', 'application/json')
        .send(mockRegisterUserFail)
        .expect({ message: 'Email exists' });
    });
  });

  describe('Register (POST) /auth/register', () => {
    it('/auth/register (POST) should return created user code', () => {
      return request(`${authEndpoint}`)
        .post('/register')
        .send(mockRegisterUser)
        .expect(201);
    });
  });

  describe('Login (POST) /auth/login', () => {
    it('/auth/login (POST) should log in user and return token', () => {
      return request(`${authEndpoint}`)
        .post('/login')
        .send(mockLoginUser)
        .then((response: request.Response) => {
          userToken = response.body.data.token;
          expect(userToken).toBeTruthy();
        });
    });
  });

  describe('Forgot password (POST) /auth/forgot/password', () => {
    it('/auth/forgot/password (POST) should return reset hash', () => {
      return request(`${authEndpoint}`)
        .post('/forgot/password')
        .send(mockResetUser)
        .then((response: request.Response) => {
          hash = response.body.data.hash;
          expect(hash).toBeTruthy();
        });
    });
  });

  describe('Reset password (POST) /auth/reset/password', () => {
    it('/auth/reset/password (POST) should reset users password with hash', () => {
      return request(`${authEndpoint}`)
        .post('/reset/password')
        .send({ hash, password: 'newPassword' })
        .expect(200)
        .then((response: request.Response) => {
          expect(response.body.message).toBe('Password reset');
        });
    });
  });

  describe('Me (GET) /auth/me', () => {
    it('/auth/me (GET) get logged in user', () => {
      return request(`${authEndpoint}`)
        .get('/me')
        .set('authorization', `Bearer ${userToken}`)
        .then((response: request.Response) => {
          expect(response.body.data).toBeTruthy();
        });
    });
  });

  describe('Me (PATCH) /auth/me', () => {
    it('/auth/me (PATCH) update logged in user info', () => {
      return request(`${authEndpoint}`)
        .patch('/me')
        .send({ first_name: 'Edited' })
        .set('authorization', `Bearer ${userToken}`)
        .then((response: request.Response) => {
          expect(response.body.data.first_name).toBe('Edited');
        });
    });
  });

  describe('Me (DELETE) /auth/me', () => {
    it('/auth/me (DELETE) delete logged in user', () => {
      return request(`${authEndpoint}`)
        .delete('/me')
        .set('authorization', `Bearer ${userToken}`)
        .then((response: request.Response) => {
          expect(response.body.message).toBe('Deleted user');
        });
    });
  });
});
