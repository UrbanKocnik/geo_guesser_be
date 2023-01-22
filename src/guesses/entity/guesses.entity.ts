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
  @Column()
  name: string;

  @Column({ type: 'double precision' })
  lat: number;

  @Column({ type: 'double precision' })
  long: number;

  @Column()
  error_distance: number;

  @ManyToOne(() => User, (user: User) => user.guesses)
  public user: User;

  @ManyToOne(() => Location, (location: Location) => location.guesses, {
    onDelete: 'CASCADE',
  })
  public location: Location;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
