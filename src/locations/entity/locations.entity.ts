import { Guess } from 'src/guesses/entity/guesses.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  coordinates: string;

  @Column()
  image: string;

  @ManyToOne(() => User, (user: User) => user.locations)
  public user: User;

  @OneToMany(() => Guess, (guess: Guess) => guess.location, { cascade: true })
  public guesses: Guess[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
