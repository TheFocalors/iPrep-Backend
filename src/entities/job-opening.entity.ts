import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

import { JobType } from '@/common/types/enums/job-type.enum';

import { City } from './city.entity';
import { Company } from './company.entity';
import { DefaultEntity } from '../common/entity/default.entity';
import { JobCategory } from './job-category.entity';
import { Skill } from './skill.entity';

@Entity('job_openings')
export class JobOpening extends DefaultEntity {
  @Column()
  title: string;

  @Column({
    nullable: true,
  })
  description: string;

  @Column()
  source: string;

  @Column({
    type: 'enum',
    enum: JobType,
  })
  jobType: JobType;

  @ManyToOne(() => City)
  city: City;

  @Column()
  salaryFrom: number; // In IDR

  @Column()
  salaryTo: number; // In IDR

  @Column('text', {
    array: true,
    nullable: true,
  })
  requirements: string[];

  @Column('text', {
    array: true,
    nullable: true,
  })
  responsibilities: string[];

  @ManyToOne(() => Company, (company) => company.jobOpenings, {
    onDelete: 'CASCADE',
  })
  company: Company;

  @ManyToOne(() => JobCategory, (jobCategory) => jobCategory.jobs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: JobCategory;

  @ManyToMany(() => Skill, (skill) => skill.job, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'job_openings_skills',
  })
  skillRequirements: Skill[];

  // @Column({
  //   nullable: true,
  //   select: false,
  // })
  // @Exclude({ toPlainOnly: true })
  // @ApiHideProperty()
  // searchVector: string;
}
