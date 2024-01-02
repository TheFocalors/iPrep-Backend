import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { Degree } from './degree.entity';
import { Institution } from './institution.entity';
import { Major } from './major.entity';
import { Profile } from './profile.entity';
import { DefaultEntity } from '../common/entity/default.entity';

@Entity('educations')
export class Education extends DefaultEntity {
  @ManyToOne(() => Degree)
  degree: Degree;

  @ManyToOne(() => Institution, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  institution: Institution;

  @ManyToOne(() => Major)
  major: Major;

  @Column()
  startDate: Date;

  @Column({
    nullable: true,
  })
  endDate: Date;

  @OneToOne(() => Profile, (profile) => profile.education, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  profile: Profile;
}
