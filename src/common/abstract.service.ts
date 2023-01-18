import { Injectable } from '@nestjs/common';
import { DeleteResult, Relation, Repository, UpdateResult } from 'typeorm';
import { PaginatedResult } from './paginated-result.interface';

@Injectable()
export abstract class AbstractService<T> {
  protected constructor(protected readonly repository: Repository<T>) {}

  async all(relations: any[] = []): Promise<T[]> {
    return await this.repository.find({ relations });
  }

  async paginate(
    page = 1,
    take = 2,
    condition = 'createdAt',
    relations: any[] = [],
  ): Promise<PaginatedResult> {
    const divider = take;
    take = take * page;

    const order = {};
    order[condition] = 'DESC';

    const [data, total_entries] = await this.repository.findAndCount({
      order,
      take,
      relations,
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

  async create(data): Promise<T> {
    return this.repository.save(data);
  }

  async findRelations(where, relations: any[] = []): Promise<T[]> {
    const query = this.repository.find({
      where,
      relations,
    });
    const result = await query;
    return result;
  }

  async findOne(where, relations: any[] = []): Promise<T> {
    return this.repository.findOne({
      where,
      relations,
    });
  }

  async update(id: number, data): Promise<UpdateResult> {
    return this.repository.update(id, data);
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.repository.delete(id);
  }
}
