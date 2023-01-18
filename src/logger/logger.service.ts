import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract.service';
import { RoleEnum } from 'src/roles/roles.enum';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateLogArrayDto } from './dto/create-log-array.dto copy';
import { Log } from './entity/logger.entity';

@Injectable()
export class LoggerService extends AbstractService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
    private usersService: UsersService,
  ) {
    super(logRepository);
  }

  async getUser(id: number): Promise<User> {
    return await this.usersService.findOne({ id }, ['role']);
  }

  async getLogs(page: number, take: number, condition: string, user: User) {
    const loggedUser = await this.getUser(user.id);
    if ([RoleEnum.admin].includes(loggedUser.role.id)) {
      const logs = await super.paginate(page, take, condition);
      if (logs.meta.total_entries === 0) {
        return {
          message: 'No logs',
          data: logs,
        };
      }
      return {
        message: 'Logs fetched',
        data: { logs },
      };
    } else {
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
  }

  async createLogEntries(user: User, logDto: CreateLogArrayDto) {
    const loggedUser = await this.getUser(user.id);
    let new_logs: Log[] = [];
    for (let index = 0; index < logDto.logs.length; index++) {
      const new_log = await super.create({
        action: logDto.logs[index].action,
        component_type: logDto.logs[index].component_type,
        user: loggedUser,
        url: logDto.logs[index].url,
        new_value: logDto.logs[index].new_value,
        action_date: logDto.logs[index].action_date,
      });
      new_logs.push(new_log);
    }
    return {
      data: new_logs,
      message: 'Created a new log entry',
    };
  }
}
