import { Exclude } from 'class-transformer';
import { Guess } from 'src/guesses/entity/guesses.entity';
import { Location } from 'src/locations/entity/locations.entity';
import { Log } from 'src/logger/entity/logger.entity';
import { Role } from 'src/roles/entity/roles.entity';
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

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  email: string | null;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ nullable: true })
  first_name: string | null;

  @Column({ nullable: true })
  last_name: string | null;

  @Column({ nullable: true })
  image: string | null;

  @ManyToOne(() => Role, (role) => role.users)
  role: Role;

  @OneToMany(() => Location, (location: Location) => location.user)
  public locations: Location[];

  @OneToMany(() => Log, (log: Log) => log.user)
  public log: Log[];

  @OneToMany(() => Guess, (guess: Guess) => guess.user)
  public guesses: Guess[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
