import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthEmailLoginDto } from 'src/auth/dto/auth-email-login.dto';
import { Role } from 'src/roles/entity/roles.entity';

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
  const rolesEndpoint = 'http://localhost:4000/api/roles';

  const mockLoginUser: AuthEmailLoginDto = {
    email: 'urban1@gmail.com',
    password: 'password123',
  };

  const mockLoginAdmin: AuthEmailLoginDto = {
    email: 'admin@gmail.com',
    password: 'password123',
  };

  let mockRole: Role = null;

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

  describe('Add role as admin (POST) /roles/add', () => {
    it('/roles/add (POST) should return create code', () => {
      return request(`${rolesEndpoint}`)
        .post('/add')
        .set('authorization', `Bearer ${adminToken}`)
        .send({ name: 'test' })
        .then((response: request.Response) => {
          mockRole = response.body.data;
          expect(201);
        });
    });
  });

  describe('Fetch roles as admin (GET) /roles/get/all', () => {
    it('/roles/get/all (GET) should return logs', () => {
      return request(`${rolesEndpoint}`)
        .get('/get/all')
        .set('authorization', `Bearer ${adminToken}`)
        .then((response: request.Response) => {
          expect(response.body.data.page_data).toBeTruthy();
        });
    });
  });
  describe('Fetch roles as user (GET) /roles/get/all', () => {
    it('/roles/get/all (GET) should return unauthorized', () => {
      return request(`${rolesEndpoint}`)
        .get('/get/all')
        .set('authorization', `Bearer ${userToken}`)
        .expect(401);
    });
  });

  describe('Fetch specific role as admin (GET) /roles/get/:id', () => {
    it('/roles/get/:id (GET) should return specified role', () => {
      return request(`${rolesEndpoint}`)
        .get(`/get/${mockRole.id}`)
        .set('authorization', `Bearer ${adminToken}`)
        .then((response: request.Response) => {
          expect(response.body.data.name).toBe('test');
        });
    });
  });

  describe('Edit specific role as admin (PATCH) /roles/edit/:id', () => {
    it('/roles/get/:id (GET) should return specified role', () => {
      return request(`${rolesEndpoint}`)
        .patch(`/edit/${mockRole.id}`)
        .send({ name: '2test2' })
        .set('authorization', `Bearer ${adminToken}`)
        .then((response: request.Response) => {
          expect(response.body.data.name).toBe('2test2');
        });
    });
  });

  describe('Delete specific role as admin (DELETE) /roles/delete/:id', () => {
    it('/roles/delete/:id (DELETE) should return specified role', () => {
      return request(`${rolesEndpoint}`)
        .delete(`/delete/${mockRole.id}`)
        .set('authorization', `Bearer ${adminToken}`)
        .then((response: request.Response) => {
          expect(response.body.message).toBe('Role deleted');
        });
    });
  });
});
