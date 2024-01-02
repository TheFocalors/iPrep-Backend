import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('institutions')
export class Institution {
  @PrimaryColumn({
    generated: 'increment',
  })
  id: number;

  @Column()
  name: string;

  @Column()
  country: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
