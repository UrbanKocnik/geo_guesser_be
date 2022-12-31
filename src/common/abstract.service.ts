import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PaginatedResult } from './paginated-result.interface';

@Injectable()
export abstract class AbstractService {
    protected constructor(
        protected readonly repository: Repository<any>
    ){}

    async all(relations: any[] = []): Promise<any[]>{
        return await this.repository.find({relations});
    }    

    async paginate(page = 1, take = 2, condition = "createdAt", relations: any[] = []): Promise<PaginatedResult>{
        const [data, total_entries] = await this.repository.findAndCount({
            order:{
                [condition]: 'DESC'
            },
            take, 
            skip: (page - 1) * take, //to pomeni 1. stran uzema iz 0, 2. iz 1 etc ker se zacne stet z 0
            relations
        });
        return {
            page_data: data,
            meta:{
                total_entries,
                page,
                last_page: Math.ceil(total_entries / take)
            }
        }
    }

    async create(data): Promise<any>{       
        return this.repository.save(data);
    }

    async findRelations(where, relations:any[] = []): Promise<any[]>{
        const query = this.repository.find({
            where,
            relations
        })
        const result = await query;
        return result;       
    }

    async findOne(where, relations:any[] = []): Promise<any>{
        return this.repository.findOne({
          where,
          relations
        });
      }

    async update(id: number, data): Promise<any>{
        return this.repository.update(id, data);
    }

    async delete(id: number):Promise<any>{
        return this.repository.delete(id);
    }
}
