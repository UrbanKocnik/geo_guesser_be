import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthEmailLoginDto } from '../src/auth/dto/auth-email-login.dto';
import { Location } from '../src/locations/entity/locations.entity';
import { CreateLocationDto } from '../src/locations/dto/create-location.dto';
import { UpdateLocationDto } from '../src/locations/dto/update-location.dto';
import { LocationsModule } from '../src/locations/locations.module';
import { AuthModule } from '../src/auth/auth.module';
import { LoggerModule } from '../src/logger/logger.module';
import { RolesModule } from '../src/roles/roles.module';
import { GuessesModule } from '../src/guesses/guesses.module';
import { AuthRegisterLoginDto } from '../src/auth/dto/auth-register-login.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../src/roles/entity/roles.entity';
import { Log } from '../src/logger/entity/logger.entity';
import { ForgotModule } from '../src/forgot/forgot.module';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Forgot } from '../src/forgot/entities/forgot.entity';
import { Guess } from '../src/guesses/entity/guesses.entity';

describe('AppController (E2E)', () => {
  let app: INestApplication;
  let mod: TestingModule;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let loggerRepository: Repository<Log>;
  let locationRepository: Repository<Location>;
  let guessRepository: Repository<Guess>;
  let forgotRepository: Repository<Forgot>;
  beforeAll(async () => {
    mod = await Test.createTestingModule({
      imports: [
        AppModule,
        LocationsModule,
        AuthModule,
        LoggerModule,
        RolesModule,
        GuessesModule,
        ForgotModule,
      ],
    }).compile();

    app = mod.createNestApplication();

    userRepository = await mod.get('UserRepository');
    roleRepository = await mod.get('RoleRepository');
    loggerRepository = await mod.get('LogRepository');
    locationRepository = await mod.get('LocationRepository');
    guessRepository = await mod.get('GuessRepository');
    forgotRepository = await mod.get('ForgotRepository');

    await app.init();

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('password123', salt);

    const adminRole = roleRepository.create({
      id: 1,
      name: 'admin',
    });
    const userRole = roleRepository.create({
      id: 2,
      name: 'user',
    });
    const savedAdminRole = await roleRepository.save(adminRole);
    const savedUserRole = await roleRepository.save(userRole);

    const adminUser = userRepository.create({
      email: 'test@gmail.com',
      password: hashedPassword,
      first_name: 'Test',
      last_name: 'User',
      image: 'default.png',
      role: savedAdminRole,
    });
    await userRepository.save(adminUser);
  });

  afterAll(async () => {
    try {
      await forgotRepository.query('DROP TABLE "forgot"');
      await loggerRepository.query('DROP TABLE "logger"');
      await guessRepository.query('DROP TABLE "guesses"');
      await locationRepository.query('DROP TABLE "locations"');
      await userRepository.query('DROP TABLE "users"');
      await roleRepository.query('DROP TABLE "roles"');
    } catch (error) {
      throw new Error(`ERROR: Cleaning test db: ${error}`);
    }
    await app.close();
  });

  const mockRegisterUser: AuthRegisterLoginDto = {
    email: 'urban12@gmail.com',
    first_name: 'User',
    last_name: 'Last',
    password: 'password123',
    password_confirm: 'password123',
  };

  const mockLog: Log = {
    id: 0,
    url: 'http://localhost:3000/profile',
    action: 'scroll',
    new_value: null,
    component_type: null,
    action_date: new Date(Date.now()),
    createdAt: new Date(Date.now()),
    deletedAt: null,
    updatedAt: new Date(Date.now()),
    user: null,
  };
  const logEntry: Log[] = [mockLog];

  const mockLoginAdmin: AuthEmailLoginDto = {
    email: 'test@gmail.com',
    password: 'password123',
  };

  const mockLoginUser: AuthEmailLoginDto = {
    email: 'urban12@gmail.com',
    password: 'password123',
  };

  const mockLoginFail: AuthEmailLoginDto = {
    email: 'urban123@gmail.com',
    password: 'password1234',
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

  let hash = null;
  let adminToken = null;
  let userToken = null;
  let mockRole: Role = null;
  let mockLocation: Location = null;
  // ------------------------------- AUTH TESTI -------------------------------

  it('/auth/register (POST) should return created user code', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(mockRegisterUser)
      .expect(201);
  });

  it('Register (POST) should fail to create a user and return message email exists', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send(mockRegisterUser)
      .expect({ message: 'Email exists' });
  });

  it('/auth/login (POST) should log in user and return token', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send(mockLoginUser)
      .then((response: request.Response) => {
        userToken = response.body.data.token;
        expect(userToken).toBeTruthy();
      });
  });

  it('/auth/login (POST) should log in admin user and return token for admin', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send(mockLoginAdmin)
      .then((response: request.Response) => {
        adminToken = response.body.data.token;
        expect(adminToken).toBeTruthy();
      });
  });

  it('/auth/login (POST) should fail due to wrong credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send(mockLoginFail)
      .then((response: request.Response) => {
        expect(response.body.message).toBe('Wrong credentials');
      });
  });

  it('/auth/forgot/password (POST) should return reset hash', () => {
    return request(app.getHttpServer())
      .post('/auth/forgot/password')
      .send({ email: 'urban12@gmail.com' })
      .then((response: request.Response) => {
        hash = response.body.data.hash;
        expect(hash).toBeTruthy();
      });
  });

  it('/auth/reset/password (POST) should reset users password with hash', () => {
    return request(app.getHttpServer())
      .post('/auth/reset/password')
      .send({ hash, password: 'newPassword' })
      .expect(200)
      .then((response: request.Response) => {
        expect(response.body.message).toBe('Password reset');
      });
  });

  it('/auth/me (GET) get logged in user', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('authorization', `Bearer ${userToken}`)
      .then((response: request.Response) => {
        expect(response.body.data).toBeTruthy();
      });
  });

  it('/auth/me (PATCH) update logged in user info', () => {
    return request(app.getHttpServer())
      .patch('/auth/me')
      .send({ first_name: 'Edited' })
      .set('authorization', `Bearer ${userToken}`)
      .then((response: request.Response) => {
        expect(response.body.data.first_name).toBe('Edited');
      });
  });

  // ------------------------------- ROLE TESTI -------------------------------

  it('/roles/add (POST) should return create code', () => {
    return request(app.getHttpServer())
      .post('/roles/add')
      .set('authorization', `Bearer ${adminToken}`)
      .send({ name: 'test' })
      .then((response: request.Response) => {
        mockRole = response.body.data;
        expect(201);
      });
  });

  it('/roles/get/all (GET) should return roles array', () => {
    return request(app.getHttpServer())
      .get('/roles/get/all')
      .set('authorization', `Bearer ${adminToken}`)
      .then((response: request.Response) => {
        expect(response.body.data.page_data).toBeTruthy();
      });
  });

  it('/roles/get/all (GET) should return unauthorized', () => {
    return request(app.getHttpServer())
      .get('/roles/get/all')
      .set('authorization', `Bearer ${userToken}`)
      .expect(401);
  });

  it('/roles/get/:id (GET) should return specified role', () => {
    return request(app.getHttpServer())
      .get(`/roles/get/${mockRole.id}`)
      .set('authorization', `Bearer ${adminToken}`)
      .then((response: request.Response) => {
        expect(response.body.data.name).toBe('test');
      });
  });

  it('/roles/get/:id (GET) should edit specified role', () => {
    return request(app.getHttpServer())
      .patch(`/roles/edit/${mockRole.id}`)
      .send({ name: '2test2' })
      .set('authorization', `Bearer ${adminToken}`)
      .then((response: request.Response) => {
        expect(response.body.data.name).toBe('2test2');
      });
  });

  it('/roles/delete/:id (DELETE) should delete specified role', () => {
    return request(app.getHttpServer())
      .delete(`/roles/delete/${mockRole.id}`)
      .set('authorization', `Bearer ${adminToken}`)
      .then((response: request.Response) => {
        expect(response.body.message).toBe('Role deleted');
      });
  });

  // ------------------------------- LOGGER TESTI -------------------------------

  it('/logger/add (POST) should return create code after adding the sent logs', () => {
    return request(app.getHttpServer())
      .post('/logger/add')
      .set('authorization', `Bearer ${adminToken}`)
      .send({ logs: logEntry })
      .expect(201);
  });

  it('/logger/all (GET) should return logs', () => {
    return request(app.getHttpServer())
      .get('/logger/all')
      .set('authorization', `Bearer ${adminToken}`)
      .then((response: request.Response) => {
        expect(response.body.data.logs).toBeTruthy();
      });
  });

  it('/logger/all (GET) should return unauthorized', () => {
    return request(app.getHttpServer())
      .get('/logger/all')
      .set('authorization', `Bearer ${userToken}`)
      .expect(401);
  });

  it('/auth/me (DELETE) delete logged in user', () => {
    return request(app.getHttpServer())
      .delete('/auth/me')
      .set('authorization', `Bearer ${userToken}`)
      .then((response: request.Response) => {
        expect(response.body.message).toBe('Deleted user');
      });
  });

  // ------------------------------- LOCATION TESTI -------------------------------

  it('/locations/add (POST) should return create code after adding location', () => {
    return request(app.getHttpServer())
      .post('/locations/add')
      .set('authorization', `Bearer ${adminToken}`)
      .send(mockLocationDto)
      .then((response: request.Response) => {
        mockLocation = response.body.data;
        expect(201);
      });
  });

  it('/locations/all (GET) should return locations', () => {
    return request(app.getHttpServer())
      .get('/locations/all')
      .set('authorization', `Bearer ${adminToken}`)
      .then((response: request.Response) => {
        expect(response.body.data.page_data).toBeTruthy();
      });
  });

  it('/locations/random (GET) should return a random location', () => {
    return request(app.getHttpServer())
      .get('/locations/random')
      .set('authorization', `Bearer ${adminToken}`)
      .then((response: request.Response) => {
        expect(response.body.data).toBeTruthy();
      });
  });

  it('/locations/:id (PATCH) should edit specified location', () => {
    return request(app.getHttpServer())
      .patch(`/locations/${mockLocation.id}`)
      .send(mockEditLocationDto)
      .set('authorization', `Bearer ${adminToken}`)
      .then((response: request.Response) => {
        expect(response.body.data.name).toBe('Jezero');
      });
  });

  it('/locations/:id (GET) should return specified location', () => {
    return request(app.getHttpServer())
      .get(`/locations/${mockLocation.id}`)
      .set('authorization', `Bearer ${adminToken}`)
      .then((response: request.Response) => {
        expect(response.body.data.name).toBe('Jezero');
      });
  });

  it('/guesses/add (POST) should return create code after creating guess', () => {
    return request(app.getHttpServer())
      .post('/guesses/add')
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

  it('/locations/best (GET) should return locations with best user guesses', () => {
    return request(app.getHttpServer())
      .get(`/locations/best`)
      .set('authorization', `Bearer ${adminToken}`)
      .then((response: request.Response) => {
        expect(response.body.data.guesses.page_data).toBeTruthy();
      });
  });

  it('/locations/guesses/:id (GET) should return specified location with guesses', () => {
    return request(app.getHttpServer())
      .get(`/locations/guesses/${mockLocation.id}`)
      .set('authorization', `Bearer ${adminToken}`)
      .then((response: request.Response) => {
        expect(response.body.data.location.id).toBe(mockLocation.id);
        expect(response.body.data.guesses.page_data).toBeTruthy();
      });
  });

  it('/locations/user (GET) should return locations that user uploaded', () => {
    return request(app.getHttpServer())
      .get(`/locations/user`)
      .set('authorization', `Bearer ${adminToken}`)
      .then((response: request.Response) => {
        expect(response.body.data.locations.page_data).toBeTruthy();
      });
  });

  it('/locations/:id (DELETE) should delete specified location with guesses', () => {
    return request(app.getHttpServer())
      .delete(`/locations/${mockLocation.id}`)
      .set('authorization', `Bearer ${adminToken}`)
      .then((response: request.Response) => {
        expect(response.body.message).toBe('Deleted location');
      });
  });
});
