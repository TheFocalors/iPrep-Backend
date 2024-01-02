import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Major } from '@/entities/major.entity';

import { MajorController } from './major.controller.';
import { MajorService } from './major.service';

@Module({
  imports: [TypeOrmModule.forFeature([Major])],
  controllers: [MajorController],
  providers: [MajorService],
  exports: [MajorService],
})
export class MajorModule {}
