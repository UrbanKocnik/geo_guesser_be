import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthEmailLoginDto } from 'src/auth/dto/auth-email-login.dto';
import { Location } from 'src/locations/entity/locations.entity';
import { CreateLocationDto } from 'src/locations/dto/create-location.dto';
import { UpdateLocationDto } from 'src/locations/dto/update-location.dto';

describe('LocationsController (E2E)', () => {
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
  const locationsEndpoint = 'http://localhost:4000/api/locations';

  let mockLocation: Location = null;
  const mockLoginAdmin: AuthEmailLoginDto = {
    email: 'admin@gmail.com',
    password: 'password123',
  };

  const mockLocationDto: CreateLocationDto = {
    name: 'Urbani EKO vrtovi, Kranjčeva ulica 4, 2000 Maribor, Slovenia',
    image: 'test image',
    long: 15.616729174107,
    lat: 46.54198535855061,
  };

  const mockEditLocationDto: UpdateLocationDto = {
    name: 'Jezero',
  };

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

  describe('Add location (POST) /locations/add', () => {
    it('/locations/add (POST) should return create code', () => {
      return request(`${locationsEndpoint}`)
        .post('/add')
        .set('authorization', `Bearer ${adminToken}`)
        .send(mockLocationDto)
        .then((response: request.Response) => {
          mockLocation = response.body.data;
          expect(201);
        });
    });
  });

  describe('Fetch locations (GET) /locations/all', () => {
    it('/locations/all (GET) should return locations', () => {
      return request(`${locationsEndpoint}`)
        .get('/all')
        .set('authorization', `Bearer ${adminToken}`)
        .then((response: request.Response) => {
          expect(response.body.data.page_data).toBeTruthy();
        });
    });
  });

  describe('Fetch random location (GET) /locations/random', () => {
    it('/locations/random (GET) should return a random location', () => {
      return request(`${locationsEndpoint}`)
        .get('/random')
        .set('authorization', `Bearer ${adminToken}`)
        .then((response: request.Response) => {
          expect(response.body.data).toBeTruthy();
        });
    });
  });

  describe('Edit specific location (PATCH) /locations/edit/:id', () => {
    it('/locations/:id (PATCH) should edit specified location', () => {
      return request(`${locationsEndpoint}`)
        .patch(`/${mockLocation.id}`)
        .send(mockEditLocationDto)
        .set('authorization', `Bearer ${adminToken}`)
        .then((response: request.Response) => {
          expect(response.body.data.name).toBe('Jezero');
        });
    });
  });

  describe('Fetch specific location (GET) /locations/:id', () => {
    it('/locations/:id (GET) should return specified role', () => {
      return request(`${locationsEndpoint}`)
        .get(`/${mockLocation.id}`)
        .set('authorization', `Bearer ${adminToken}`)
        .then((response: request.Response) => {
          expect(response.body.data.name).toBe('Jezero');
        });
    });
  });

  describe('Fetch best user guesses (GET) /locations/best', () => {
    it('/locations/best (GET) should return locations with best user guesses', () => {
      return request(`${locationsEndpoint}`)
        .get(`/best`)
        .set('authorization', `Bearer ${adminToken}`)
        .then((response: request.Response) => {
          expect(response.body.data.guesses.page_data).toBeTruthy();
        });
    });
  });

  describe('Fetch specific location with guesses(GET) /locations/guesses/:id', () => {
    it('/locations/guesses/:id (GET) should return specified location with guesses', () => {
      return request(`${locationsEndpoint}`)
        .get(`/guesses/8`)
        .set('authorization', `Bearer ${adminToken}`)
        .then((response: request.Response) => {
          expect(response.body.data.location.id).toBe(8);
          expect(response.body.data.guesses.page_data).toBeTruthy();
        });
    });
  });

  describe('Fetch user uploaded location (GET) /locations/user', () => {
    it('/locations/user (GET) should return locations that user uploaded', () => {
      return request(`${locationsEndpoint}`)
        .get(`/user`)
        .set('authorization', `Bearer ${adminToken}`)
        .then((response: request.Response) => {
          expect(response.body.data.locations.page_data).toBeTruthy();
        });
    });
  });

  describe('Delete specific location (DELETE) /locations/:id', () => {
    it('/locations/:id (DELETE) should delete specified role', () => {
      return request(`${locationsEndpoint}`)
        .delete(`/${mockLocation.id}`)
        .set('authorization', `Bearer ${adminToken}`)
        .then((response: request.Response) => {
          expect(response.body.message).toBe('Deleted location');
        });
    });
  });
});
