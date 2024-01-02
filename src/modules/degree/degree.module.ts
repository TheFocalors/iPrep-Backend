import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Degree } from '@/entities/degree.entity';

import { DegreeController } from './degree.controller';
import { DegreeService } from './degree.service';

@Module({
  imports: [TypeOrmModule.forFeature([Degree])],
  controllers: [DegreeController],
  providers: [DegreeService],
  exports: [DegreeService],
})
export class DegreeModule {}
