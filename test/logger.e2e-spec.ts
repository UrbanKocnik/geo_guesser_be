import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthEmailLoginDto } from 'src/auth/dto/auth-email-login.dto';
import { Log } from '../src/logger/entity/logger.entity';

describe('LoggerController (E2E)', () => {
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
  const loggerEndpoint = 'http://localhost:4000/api/logger';

  const mockLoginUser: AuthEmailLoginDto = {
    email: 'urban1@gmail.com',
    password: 'password123',
  };

  const mockLoginAdmin: AuthEmailLoginDto = {
    email: 'admin@gmail.com',
    password: 'password123',
  };

  const mockLog: Log = {
    id: 0,
    url: 'http://localhost:3000/profile',
    action: 'scroll',
    new_value: '',
    component_type: '',
    action_date: new Date(Date.now()),
    createdAt: new Date(Date.now()),
    deletedAt: null,
    updatedAt: new Date(Date.now()),
    user: null,
  };
  const logEntry: Log[] = [mockLog];

  let userToken = null;
  let adminToken = null;

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

  describe('Login (POST) /auth/login', () => {
    it('/auth/login (POST) should log in user and return token for admin', () => {
      return request(`${authEndpoint}`)
        .post('/login')
        .send(mockLoginAdmin)
        .then((response: request.Response) => {
          adminToken = response.body.data.token;
          expect(adminToken).toBeTruthy();
        });
    });
  });

  describe('Add logs as admin (POST) /logger/add', () => {
    it('/logger/add (POST) should return create code', () => {
      return request(`${loggerEndpoint}`)
        .post('/add')
        .set('authorization', `Bearer ${adminToken}`)
        .send({ logs: logEntry })
        .expect(201);
    });
  });

  describe('Fetch logs as admin (GET) /logger/all', () => {
    it('/logger/all (GET) should return logs', () => {
      return request(`${loggerEndpoint}`)
        .get('/all')
        .set('authorization', `Bearer ${adminToken}`)
        .then((response: request.Response) => {
          expect(response.body.data.logs).toBeTruthy();
        });
    });
  });
  describe('Fetch logs as user (GET) /logger/all', () => {
    it('/logger/all (GET) should return unauthorized', () => {
      return request(`${loggerEndpoint}`)
        .get('/all')
        .set('authorization', `Bearer ${userToken}`)
        .expect(401);
    });
  });
});
