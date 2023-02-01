import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthEmailLoginDto } from 'src/auth/dto/auth-email-login.dto';
import { Location } from 'src/locations/entity/locations.entity';

describe('GuessesController (E2E)', () => {
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
  const guessesEndpoint = 'http://localhost:4000/api/guesses';
  const locationsEndpoint = 'http://localhost:4000/api/locations';

  const mockLoginAdmin: AuthEmailLoginDto = {
    email: 'admin@gmail.com',
    password: 'password123',
  };

  let mockLocation: Location = null;

  let adminToken = null;

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

  describe('Fetch random location (GET) /locations/random', () => {
    it('/locations/random (GET) should return a random location', () => {
      return request(`${locationsEndpoint}`)
        .get('/random')
        .set('authorization', `Bearer ${adminToken}`)
        .then((response: request.Response) => {
          mockLocation = response.body.data[0];
          expect(response.body.data).toBeTruthy();
        });
    });
  });
  describe('Add guess (POST) /guesses/add', () => {
    it('/guesses/add (POST) should return create code after creating guess', () => {
      return request(`${guessesEndpoint}`)
        .post('/add')
        .set('authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Grad',
          error_distance: 2000,
          long: 15.616729174107,
          lat: 46.54198535855061,
          location: mockLocation,
        })
        .expect(201);
    });
  });
});
