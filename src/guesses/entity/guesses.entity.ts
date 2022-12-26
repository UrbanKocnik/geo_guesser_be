import { User } from 'src/users/entities/user.entity';
import { Location } from 'src/locations/entity/locations.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('guesses')
export class Guess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  coordinates: string;

  @Column()
  error_distance: number;

  @ManyToOne(() => User, (user: User) => user.guesses)
  public user: User;

  @ManyToOne(() => Location, (location: Location) => location.guesses)
  public location: Location;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
