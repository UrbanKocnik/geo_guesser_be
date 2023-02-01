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

@Entity('logger')
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column({ nullable: true })
  component_type: string;

  @Column({ nullable: true })
  new_value: string;

  @Column()
  url: string;

  @ManyToOne(() => User, (user: User) => user.log, {
    onDelete: 'CASCADE',
  })
  public user: User;

  @Column({ nullable: true })
  action_date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
