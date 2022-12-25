import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract.service';
import { DeepPartial } from 'src/utils/types/deep-partial.type';
import { Repository } from 'typeorm';
import { Forgot } from './entities/forgot.entity';

@Injectable()
export class ForgotService extends AbstractService {
  constructor(
    @InjectRepository(Forgot)
    private forgotRepository: Repository<Forgot>,
  ) {
    super(forgotRepository)
  }

  async create(data: DeepPartial<Forgot>) {
    return this.forgotRepository.save(this.forgotRepository.create(data));
  }

  async delete(id: number): Promise<void> {
    await this.forgotRepository.delete(id);
  }
}
