import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';

import { JobType } from '@/common/types/enums/job-type.enum';

import { City } from './city.entity';
import { DefaultEntity } from '../common/entity/default.entity';
import { Education } from './education.entity';
import { JobCategory } from './job-category.entity';
import { Skill } from './skill.entity';
import { User } from './user.entity';

@Entity('profiles')
export class Profile extends DefaultEntity {
  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @Column()
  birthday: Date;

  @Column({
    nullable: true,
  })
  avatar: string;

  @Column({
    nullable: true,
  })
  avatarThumbnail: string;

  @OneToOne(() => Education, (education) => education.profile, {
    eager: true,
    cascade: true,
  })
  education: Education;

  @ManyToMany(() => Skill, {
    eager: true,
  })
  @JoinTable({
    name: 'users_skills',
  })
  skills: Skill[];

  @ManyToOne(() => City, {
    eager: true,
  })
  city: City;

  @Column({
    array: true,
    type: 'enum',
    enum: JobType,
  })
  preferredJobTypes: JobType[];

  @ManyToMany(() => City, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'users_preferred_cities',
  })
  preferredCities: City[];

  @ManyToMany(() => JobCategory, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'users_preferred_job_categories',
  })
  preferredJobCategories: JobCategory[];

  @Column()
  expectedSalary: number;
}
