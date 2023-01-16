import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract.service';
import { PaginatedResult } from 'src/common/paginated-result.interface';
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
      long: locationDto.long,
      lat: locationDto.lat,
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
        data: { location },
      };
    }
    return {
      message: 'Location data and guesses fetched',
      data: { guesses, location },
    };
  }

  async getLocation(id: number) {
    const location = await super.findOne({ id });
    return {
      message: 'Location data and guesses fetched',
      data: location,
    };
  }

  async getUserLocations(
    user: User,
    page: number,
    take: number,
    condition: string,
    order: string,
  ) {
    const loggedUser = await this.getUser(user.id);
    const locations = await this.userLocationsPaginate(
      user.id,
      page,
      take,
      condition,
      order,
    );

    if (locations.meta.total_entries === 0) {
      return {
        message: 'User has no locations',
        data: locations,
      };
    }
    return {
      message: 'User locations fetched',
      data: { locations, loggedUser },
    };
  }

  async getUserLocationGuesses(
    user: User,
    page: number,
    take: number,
    condition: string,
    order: string,
  ) {
    const loggedUser = await this.getUser(user.id);
    const guesses = await this.guessesService.userGuessesPaginate(
      user.id,
      page,
      take,
      condition,
      order,
    );

    if (guesses.meta.total_entries === 0) {
      return {
        message: 'User has no guesses',
        data: guesses,
      };
    }
    return {
      message: 'User guesses fetched',
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
    console.log(location.user.id, loggedUser.id);
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
    } else {
      const location = await super.findOne({ id }, ['user', 'guesses']);
      await super.delete(id);
      return {
        data: location,
        message: 'Deleted location',
      };
    }
  }

  async userLocationsPaginate(
    where,
    page = 1,
    take = 4,
    condition,
    order = 'DESC',
  ): Promise<PaginatedResult> {
    take = take * page;
    const [data, total_entries] = await this.repository.findAndCount({
      order: {
        [condition]: order,
      },
      where: {
        user: {
          id: where,
        },
      },
      take,
    });
    return {
      page_data: data,
      meta: {
        total_entries,
        page,
        last_page: Math.ceil(total_entries / take),
      },
    };
  }
}
