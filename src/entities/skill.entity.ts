import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { JobOpening } from './job-opening.entity';

@Entity('skills')
export class Skill {
  @PrimaryColumn({
    generated: 'increment',
  })
  id: number;

  @Column()
  name: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => JobOpening, (job) => job.skillRequirements, {
    onDelete: 'CASCADE',
  })
  job: JobOpening[];
}
