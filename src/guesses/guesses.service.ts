import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract.service';
import { PaginatedResult } from 'src/common/paginated-result.interface';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Long, Repository } from 'typeorm';
import { CreateGuessDto } from './dto/create-guess.dto';
import { Guess } from './entity/guesses.entity';

@Injectable()
export class GuessesService extends AbstractService<Guess> {
  constructor(
    @InjectRepository(Guess)
    private guessesRepository: Repository<Guess>,
    private usersService: UsersService,
  ) {
    super(guessesRepository);
  }

  async getUser(id: number): Promise<User> {
    return await this.usersService.findOne({ id }, ['role']);
  }

  async createGuess(user: User, guessDto: CreateGuessDto) {
    const loggedUser = await this.getUser(user.id);
    let guess = await this.userExistingGuess(user.id, guessDto.location.id);
    if (guess) {
      await this.update(guess.id, guessDto);
    } else {
      guess = await super.create({
        name: guessDto.name,
        lat: guessDto.lat,
        long: guessDto.long,
        user: loggedUser,
        error_distance: guessDto.error_distance,
        location: guessDto.location,
      });
    }

    return {
      data: guess,
      message: 'User made a guess',
    };
  }

  async locationGuessesPaginate(
    where,
    page = 1,
    take = 2,
    condition = 'error_distance',
  ): Promise<PaginatedResult> {
    const divider = take;
    take = take * page;
    const [data, total_entries] = await this.repository.findAndCount({
      order: {
        [condition]: 'ASC',
      },
      where: {
        location: {
          id: where,
        },
      },
      take,
      relations: {
        user: true,
      },
    });
    return {
      page_data: data,
      meta: {
        total_entries,
        page,
        last_page: Math.ceil(total_entries / divider),
      },
    };
  }

  async userGuessesPaginate(
    where,
    page = 1,
    take = 2,
    condition,
    order = 'ASC',
  ): Promise<PaginatedResult> {
    const divider = take;
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
      relations: {
        location: true,
      },
    });
    return {
      page_data: data,
      meta: {
        total_entries,
        page,
        last_page: Math.ceil(total_entries / divider),
      },
    };
  }

  async userExistingGuess(
    user_id: number,
    location_id: number,
  ): Promise<Guess> {
    const data = await this.repository.findOne({
      where: {
        user: {
          id: user_id,
        },
        location: {
          id: location_id,
        },
      },
    });
    return data;
  }
}
