import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract.service';
import { GuessesService } from 'src/guesses/guesses.service';
import { RoleEnum } from 'src/roles/roles.enum';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entity/locations.entity';
import { locationsRepository } from './locations.repository';

@Injectable()
export class LocationsService extends AbstractService {
  constructor(
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
    private subLocationsRepository: locationsRepository,
    private usersService: UsersService,
    private guessesService: GuessesService,
  ) {
    super(locationsRepository);
  }

  async getUser(id: number): Promise<User> {
    return await this.usersService.findOne({ id }, ['role']);
  }

  async getLocations(page: number, take: number, condition: string) {
    const locations = await super.paginate(page, take, condition);
    return {
      message: 'Newest locations fetched',
      data: locations,
    };
  }

  async createLocation(user: User, locationDto: CreateLocationDto) {
    const loggedUser = await this.getUser(user.id);
    const new_location = await super.create({
      name: locationDto.name,
      coordinates: locationDto.coordinates,
      user: loggedUser,
      image: locationDto.image,
    });

    return {
      data: new_location,
      message: 'Created a new location',
    };
  }

  async getRandomLocation() {
    const id = await this.randomLocation();
    return {
      message: 'Random location fetched',
      data: id,
    };
  }

  async randomLocation() {
    const result = await this.locationsRepository.query(`
        SELECT *
        FROM locations l
        ORDER BY RANDOM()
        LIMIT 1;`);
    return result;
  }

  async getLocationGuesses(
    id: number,
    page: number,
    take: number,
    condition: string,
  ) {
    const location = await super.findOne({ id });
    const guesses = await this.guessesService.locationGuessesPaginate(
      id,
      page,
      take,
      condition,
    );
    if (guesses.meta.total_entries === 0) {
      return {
        message: 'Location data fetched',
        data: location,
      };
    }
    return {
      message: 'Location data and guesses fetched',
      data: { guesses, location },
    };
  }

  async getBestLocationGuesses(
    user: User,
    page: number,
    take: number,
    condition: string,
  ) {
    const loggedUser = await this.getUser(user.id);
    const guesses = await this.guessesService.bestUserGuessesPaginate(
      user.id,
      page,
      take,
      condition,
    );

    if (guesses.meta.total_entries === 0) {
      return {
        message: 'User has no guesses',
        data: guesses,
      };
    }
    return {
      message: 'Closest guesses of user fetched',
      data: { guesses, loggedUser },
    };
  }

  async updateLocation(user: User, id: number, locationDto: UpdateLocationDto) {
    const loggedUser = await this.getUser(user.id);
    const location = await super.findOne({ id }, ['user']);
    if (location.user.id != loggedUser.id) {
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
    await super.update(id, locationDto);
    const updated_location = await super.findOne({ id }, ['user']);
    return {
      message: 'Location edited',
      data: updated_location,
    };
  }

  async deleteLocation(id: number, user: User): Promise<any> {
    const loggedUser = await this.getUser(user.id);
    const location = await super.findOne({ id }, ['user']);
    if (
      location.user.id != loggedUser.id &&
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
    } else {
      const location = await super.findOne({ id }, ['user', 'guesses']);
      await super.delete(id);
      return {
        data: location,
        message: 'Deleted location',
      };
    }
  }
}
