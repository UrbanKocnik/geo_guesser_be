import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract.service';
import { DeepPartial } from 'src/utils/types/deep-partial.type';
import { DeleteResult, Repository } from 'typeorm';
import { Forgot } from './entities/forgot.entity';

@Injectable()
export class ForgotService extends AbstractService<Forgot> {
  constructor(
    @InjectRepository(Forgot)
    private forgotRepository: Repository<Forgot>,
  ) {
    super(forgotRepository);
  }

  async create(data: DeepPartial<Forgot>) {
    return this.forgotRepository.save(this.forgotRepository.create(data));
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.forgotRepository.delete(id);
  }
}
