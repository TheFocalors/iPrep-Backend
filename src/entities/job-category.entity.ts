import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { JobOpening } from './job-opening.entity';

@Entity('job_categories')
export class JobCategory {
  @PrimaryColumn({
    generated: 'increment',
  })
  id: number;

  @Column({
    unique: true,
  })
  name: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => JobOpening, (job) => job.category)
  jobs: JobOpening[];
}
