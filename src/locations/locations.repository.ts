import { Repository } from 'typeorm';

export class locationsRepository extends Repository<Location> {
  async randomLocation() {
    return super.query(`
        SELECT *
        FROM locations l
        ORDER BY RANDOM()
        LIMIT 1;`);
  }
}
