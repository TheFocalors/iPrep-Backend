import { Transform } from 'class-transformer';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { bucketUrl } from '@/common/constants/bucket-url.constant';

import { City } from './city.entity';
import { JobOpening } from './job-opening.entity';
import { DefaultEntity } from '../common/entity/default.entity';

@Entity('companies')
export class Company extends DefaultEntity {
  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  description: string;

  @ManyToOne(() => City, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  location: City;

  @Column({
    nullable: true,
  })
  @Transform(({ value }) => bucketUrl.COMPANY_LOGO + value, {
    toPlainOnly: true,
  })
  logo: string;

  @OneToMany(() => JobOpening, (jobOpenings) => jobOpenings.company)
  jobOpenings: JobOpening[];
}
