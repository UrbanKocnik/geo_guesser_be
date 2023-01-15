import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract.service';
import { PaginatedResult } from 'src/common/paginated-result.interface';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateGuessDto } from './dto/create-guess.dto';
import { Guess } from './entity/guesses.entity';

@Injectable()
export class GuessesService extends AbstractService {
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
    const new_guess = await super.create({
      lat: guessDto.lat,
      long: guessDto.long,
      user: loggedUser,
      error_distance: guessDto.error_distance,
      location: guessDto.location,
    });

    return {
      data: new_guess,
      message: 'User made a guess',
    };
  }

  async locationGuessesPaginate(
    where,
    page = 1,
    take = 2,
    condition = 'error_distance',
  ): Promise<PaginatedResult> {
    take = take * page;
    console.log(take);
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
        last_page: Math.ceil(total_entries / take),
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
        last_page: Math.ceil(total_entries / take),
      },
    };
  }
}
