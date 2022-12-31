import { Repository } from 'typeorm';

export class locationsRepository extends Repository<Location> {
  async randomLocation() {
    const result = await this.query(`
        SELECT *
        FROM locations l
        ORDER BY RANDOM()
        LIMIT 1;`);
    return result;
  }
}
